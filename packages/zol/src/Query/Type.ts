import { nextGlobalNameSupply } from "../Compile";
import { GenState, initState, Name, Scope, showName } from "../GenState";
import * as State from "../StateMonad";
import { ColName } from "../Types";

export class Query<s, a> implements PromiseLike<a> {
    /**
     * This is what Query is really about
     */
    public unQ: State.State<GenState, a>;

    protected dummy: [Query<s, a>, s, a];

    public constructor(fn: (resolve: (y: State.State<GenState, a> | Query<s, a>) => void) => void) {
        fn(x => this.resolve(x));
    }

    public then<TResult1 = a>(
        onfulfilled?: ((value: a) => TResult1 | PromiseLike<TResult1>) | undefined | null)
        : Query<s, TResult1> {
        if (onfulfilled === null || onfulfilled === undefined) {
            throw new Error("missing onfulfilled");
        }
        console.log("then");

        const onfulfilled2: ((value: a) => TResult1 | Query<s, TResult1>) = <any>onfulfilled;

        return new Query<s, TResult1>((resolve: (y: State.State<GenState, TResult1>) => void) => {
            // tslint:disable-next-line:strict-type-predicates
            if (this.unQ === null) {
                throw new Error("Invalid State");
            }
            resolve(State.bind<GenState, a, TResult1>(this.unQ, (x: a): State.State<GenState, TResult1> => {
                const y = onfulfilled2(x);
                if (y instanceof Query) {
                    return y.unQ;
                } else {
                    return State.pure<GenState, TResult1>(y);
                }
            }));
        });
    }

    private resolve(result: State.State<GenState, a> | Query<s, a>): void {
        if (result instanceof Query) {
            result.then(x => {
                console.log("x", typeof x, x);
                this.resolve(State.pure(x)); // TODO Is this correct???
            });
        } else {
            this.unQ = result;
        }
    }
}

/**
 * Run a query computation from an initial state.
 */
export function runQueryM<s, a>(scope: Scope, query: Query<s, a>): [a, GenState] {
    return query.unQ.runState(initState(scope));
}

export function queryPure<s, a>(a: a): Query<s, a> {
    return new Query(resolve => {
        resolve(State.pure(a));
    });
}

export function queryBind<s, a, b>(lhs: Query<s, a>, rhs: (x: a) => Query<s, b>): Query<s, b> {
    // tslint:disable-next-line:strict-type-predicates
    if (lhs.unQ === undefined) {
        console.log("queryBind Query not ready");
    }
    return new Query(resolve => {
        resolve(State.bind(lhs.unQ, (x: a) => rhs(x).unQ));
    });
}

/**
 * Run a query computation in isolation, but reusing the current name supply.
 */
export function isolate<s, a>(q: Query<s, a>): State.State<GenState, [GenState, a]> {
    return State.bind(
        State.get(),
        st => State.bind(
            State.put(
                initState(st.nameScope)
            ),
            () => State.bind(
                q.unQ,
                x => State.bind(
                    State.get(),
                    st2 => State.bind(
                        State.put(st),
                        () => State.pure<GenState, [GenState, a]>([st2, x])
                    )
                )
            )
        )
    );
}

/**
 * Get a guaranteed unique identifier.
 */
export function freshId(): State.State<GenState, Name> {
    return State.bind(
        State.get(),
        st => State.pure({
            scope: st.nameScope,
            ident: nextGlobalNameSupply()
        })
    );
}

/**
 * Get a guaranteed unique column name.
 */
export function freshName(): State.State<GenState, ColName> {
    return State.bind(
        freshId(),
        n => State.pure(ColName.wrap("tmp_" + showName(n)))
    );
}

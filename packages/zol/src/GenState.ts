import { assertNever } from "./assertNever";
import { Exp, SomeCol } from "./Exp";
import { freshId } from "./Query/Type";
import { SQL } from "./SQL";
import * as State from "./StateMonad";
import { addColSuffix, ColName } from "./Types";

export type Scope = number;
export type Ident = number;

/**
 * A name, consisting of a scope and an identifier.
 */
export interface Name {
    scope: Scope;
    ident: Ident;
}

export function showName(name: Name): string {
    if (name.scope === 0) {
        return "" + name.ident;
    } else {
        return "" + name.scope + "s_" + name.ident;
    }
}

export interface GenState {
    readonly sources: SQL[];
    readonly staticRestricts: Exp<SQL, boolean>[];
    readonly groupCols: SomeCol<SQL>[];
    readonly nameSupply: number;
    readonly nameScope: number;
}

export function initState(scope: number): GenState {
    return {
        sources: [],
        staticRestricts: [],
        groupCols: [],
        nameSupply: 0,
        nameScope: scope
    };
}

export function rename<sql>(x: SomeCol<sql>): State.State<GenState, SomeCol<sql>> {
    switch (x.type) {
        case "Some": {
            const newName = (ns: Name): ColName => {
                switch (x.exp.type) {
                    case "ECol":
                        return addColSuffix(x.exp.colName, "_" + showName(ns));
                    default:
                        return ColName.wrap("tmp_" + showName(ns));
                }
            };
            return State.bind(freshId(), n => {
                const named: SomeCol<sql> = {
                    type: "Named",
                    colName: newName(n),
                    exp: x.exp,
                    parser: x.parser,
                    propName: <any>undefined // doesn't look like this is needed
                };
                return State.pure(named);
            });
        }
        case "Named":
            return State.pure(x);
        /* istanbul ignore next */
        default:
            return assertNever(x);
    }
}

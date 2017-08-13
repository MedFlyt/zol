import { assertNever } from "./assertNever";
import { Exp, SomeCol } from "./Exp";
import { SQL } from "./SQL";
import * as State from "./StateMonad";
import { addColSuffix, ColName } from "./Types";

export interface GenState {
    readonly sources: SQL[];
    readonly staticRestricts: Exp<SQL, boolean>[];
    readonly groupCols: SomeCol<SQL>[];
    readonly nameSupply: number;
}

export const initState: GenState = {
    sources: [],
    staticRestricts: [],
    groupCols: [],
    nameSupply: 0
};

export function rename<sql>(x: SomeCol<sql>): State.State<GenState, SomeCol<sql>> {
    switch (x.type) {
        case "Some": {
            const newName = (ns: number): ColName => {
                switch (x.exp.type) {
                    case "ECol":
                        return addColSuffix(x.exp.colName, "_" + ns);
                    default:
                        return ColName.wrap("tmp_" + ns);
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

export function freshId(): State.State<GenState, number> {
    return State.bind(
        State.get(),
        st => State.bind(
            State.put({ ...st, nameSupply: st.nameSupply + 1 }),
            () => State.pure(st.nameSupply)));
}

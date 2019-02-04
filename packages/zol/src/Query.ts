import { Col, colUnwrap, colWrap } from "./Column";
import { compQuery, finalCols, freshScope } from "./Compile";
import { Exp, SomeCol } from "./Exp";
import { GenState, rename } from "./GenState";
import { freshName, isolate, Query, queryBind, queryPure } from "./Query/Type";
import { JoinType, Order, SQL, sqlFrom } from "./SQL";
import { SqlType } from "./SqlType";
import * as State from "./StateMonad";
import { Table } from "./Table";
import { allCols, colNames, state2sql } from "./Transform";
import { ColName, TableName } from "./Types";

function mkSome<sql, a>(val: Exp<sql, a>, parser: (val: string) => a): SomeCol<sql> {
    return {
        type: "Some",
        exp: val,
        parser: parser
    };
}

function mkCol<sql, a>(val: ColName, parser: (val: string) => a): Exp<sql, a> {
    return {
        type: "ECol",
        correlation: null,
        colName: val,
        parser: parser
    };
}

/**
 * The type of [[defaultValue]]. You cannot instantiate values of this.
 */
export class DefaultValue {
    protected dummy: DefaultValue;
}

const defValue: DefaultValue = <any>{};

/**
 * Can be used in `insert` and `update` operations, to set the value
 * of a column to its default value.
 *
 * This can only be used on table columns that have been declared as
 * "default-able" when the table was declared using [[declareTable]].
 *
 * This is like using the `DEFAULT` keyword in SQL.
 */
export function defaultValue(): DefaultValue {
    return defValue;
}

export type MakeCols<s, T extends object> = {
    [P in keyof T]: Col<s, T[P]>;
};

export class Write {
    protected dummy: Write;
}

export type MakeTable<T1 extends object, T2 extends object> = {
    [P in keyof T1]: Col<Write, T1[P]>;
} & {
        [P in keyof T2]: Col<Write, T2[P]> | DefaultValue;
    };

export function select<s, a extends object, b extends object>(table: Table<a, b>): Query<s, MakeCols<s, a & b>> {
    const cs2 = table.tableCols.map<[ColName, string, (val: string) => any]>(c => [c.name, c.propName, c.parser]);
    const result: Query<s, MakeCols<s, a & b>> = new Query(resolve => {
        resolve(
            State.bind
                (
                    State.mapM(x => State.bind<GenState, SomeCol<SQL>, [SomeCol<SQL>, string, (val: string) => any]>(rename(mkSome(mkCol(x[0], x[2]), x[2])), y => State.pure<GenState, [SomeCol<SQL>, string, (val: string) => any]>([y, x[1], x[2]])), cs2),
                    (rns: [SomeCol<SQL>, string, (val: string) => any][]) =>
                        State.bind
                            (
                                State.get(),
                                st => {
                                    const newSource = sqlFrom(rns.map(x => x[0]), {
                                        type: "TableName",
                                        tableName: table.tableName
                                    });
                                    const st2: GenState = {
                                        ...st,
                                        sources: [newSource].concat(st.sources)
                                    };
                                    return State.bind
                                        (
                                            State.put(st2),
                                            () => State.pure(toTup(someColNames2(rns), null))
                                        );
                                }
                            )
                ));
    });
    return result;
}

/**
 * Query an ad hoc table. Each element in the given list represents one row
 * in the ad hoc table.
 */
export function selectValues<s, a extends object>(vals: MakeCols<s, a>[]): Query<s, MakeCols<s, a>> {
    if (vals.length === 0) {
        const result: Query<s, MakeCols<s, a>> = new Query(resolve => {
            resolve(
                State.bind(
                    State.get(),
                    st => {
                        const s2 = sqlFrom([], {
                            type: "EmptyTable"
                        });
                        return State.bind(
                            State.put({
                                ...st,
                                sources: [s2].concat(st.sources)
                            }),
                            () => State.pure(<any>{})
                        );
                    }
                )
            );
        });
        return result;
    }

    const row = vals[0];
    const rows = vals.slice(1);
    const firstrow = finalCols(row);
    const mkFirstRow = (ns: ColName[]): SomeCol<SQL>[] => {
        const results: SomeCol<SQL>[] = [];
        for (let i = 0; i < firstrow.length; ++i) {
            results.push({
                type: "Named",
                colName: ns[i],
                exp: firstrow[i].exp,
                parser: firstrow[i].parser,
                propName: (<any>firstrow[i]).propName
            });
        }
        return results;
    };
    const rows2 = rows.map(finalCols);
    const result: Query<s, MakeCols<s, a>> = new Query(resolve => {
        resolve(
            State.bind(
                State.mapM(() => freshName(), firstrow),
                names => {
                    const rns: SomeCol<SQL>[] = [];
                    let i = 0;
                    for (const n of names) {
                        rns.push({
                            type: "Named",
                            colName: n,
                            exp: {
                                type: "ECol",
                                correlation: null,
                                colName: n,
                                parser: () => { throw new Error("ECol parser"); }
                            },
                            parser: (<any>firstrow[i]).parser,
                            propName: (<any>firstrow[i]).propName
                        });
                        i++;
                    }
                    const row2 = mkFirstRow(names);
                    return State.bind(
                        State.get(),
                        s => {
                            const s2 = sqlFrom(rns, {
                                type: "Values",
                                cols: row2,
                                params: rows2
                            });
                            return State.bind(
                                State.put({
                                    ...s,
                                    sources: [s2].concat(s.sources)
                                }),
                                () => {
                                    const ts: [ColName, string, (val: string) => any][] = [];
                                    for (const r of rns) {
                                        ts.push([(<SomeCol.Named<SQL>>r).colName, (<SomeCol.Named<SQL>>r).propName, r.parser]);
                                    }
                                    return State.pure(toTup(ts, null));
                                }
                            );
                        }
                    );
                }
            ));
    });
    return result;
}

export function restrict<s>(expr: Col<s, boolean>): Query<s, void> {
    const result: Query<s, void> = new Query(resolve => {
        resolve(
            State.bind(State.get(), st =>
                State.put((() => {
                    if (st.sources.length === 0) {
                        return {
                            ...st,
                            staticRestricts: [colUnwrap(expr)].concat(st.staticRestricts)
                        };
                    } else if (st.sources.length === 1 && !wasRenamedIn(colUnwrap(expr), st.sources[0].cols)) {
                        return {
                            ...st,
                            sources: [{
                                ...st.sources[0],
                                restricts: [colUnwrap(expr)].concat(st.sources[0].restricts)
                            }]
                        };
                    } else {
                        const source2 = sqlFrom(allCols(st.sources), {
                            type: "Product",
                            sqls: st.sources
                        });
                        return {
                            ...st,
                            sources: [{
                                ...source2,
                                restricts: [colUnwrap(expr)]
                            }]
                        };
                    }
                })()))
        );
    });
    return result;
}

export function aggregate<s, a extends object>(q: Query<Inner<s>, AggrCols<s, a>>): Query<s, MakeCols<s, a>> {
    return new Query(resolve => {
        resolve(
            State.bind(
                isolate(q),
                is => {
                    const [gst, aggrs] = is;
                    return State.bind(
                        State.mapM(x => State.bind(rename(<any>x[0]), y => State.pure<GenState, [SomeCol<SQL>, string, (val: string) => any]>([<any>y, x[1], x[2]])), fromTup(<any>aggrs)),
                        (cs: [SomeCol<SQL>, string, (val: string) => any][]) => {
                            const sql: SQL = {
                                ...sqlFrom(cs.map(x => x[0]), {
                                    type: "Product",
                                    sqls: [state2sql(gst)]
                                }),
                                groups: gst.groupCols
                            };
                            return State.bind(
                                State.modify(st => ({
                                    ...st,
                                    sources: [sql].concat(st.sources)
                                })),
                                () => State.pure(toTup(someColNames2(cs), null))
                            );
                        }
                    );
                }
            )
        );
    });
}

export function groupBy<s, a>(col: Col<Inner<s>, a>): Query<Inner<s>, Aggr<Inner<s>, a>> {
    const g: SomeCol<SQL>[] = [{
        type: "Some",
        exp: colUnwrap(col),
        parser: <any>null // TODO Check that this is corect
    }];
    return new Query(resolve => {
        resolve(
            State.bind(
                State.get(),
                st => State.bind(
                    State.put({
                        ...st,
                        groupCols: g.concat(st.groupCols)
                    }),
                    () => State.pure(<any>colUnwrap(col))
                )
            )
        );
    });
}

export function limit<s, a extends object>(from: number, to: number, q: Query<Inner<s>, MakeCols<Inner<s>, a>>): Query<s, MakeCols<s, a>> {
    return new Query(resolve => {
        resolve(
            State.bind(
                isolate(q),
                is => {
                    const [lim_st, res] = is;
                    return State.bind(
                        State.get(),
                        st => {
                            let sql: SQL;
                            if (lim_st.sources.length === 1 && lim_st.sources[0].limits === null) {
                                sql = lim_st.sources[0];
                            } else {
                                sql = sqlFrom(allCols(lim_st.sources), {
                                    type: "Product",
                                    sqls: lim_st.sources
                                });
                            }
                            const sql2: SQL = {
                                ...sql,
                                limits: [from, to]
                            };
                            return State.bind(
                                State.put({
                                    ...st,
                                    sources: [sql2].concat(st.sources)
                                }),
                                () => State.pure(<any>res)
                            );
                        }
                    );
                }
            )
        );
    });
}

export function order<s, a>(col: Col<s, a>, order: Order): Query<s, void> {
    return new Query(resolve => {
        resolve(
            State.bind(
                State.get(),
                st => {
                    const newOrder: [Order, SomeCol<SQL>] = [order, {
                        type: "Some",
                        exp: colUnwrap(col),
                        parser: (_val: string) => { throw new Error("TODO"); }
                    }];
                    const sql = sqlFrom(allCols(st.sources), {
                        type: "Product",
                        sqls: st.sources
                    });
                    if (st.sources.length === 1) {
                        return State.put({
                            ...st,
                            sources: [{
                                ...sql,
                                ordering: [newOrder].concat(sql.ordering)
                            }]
                        });
                    } else {
                        return State.put({
                            ...st,
                            sources: [{
                                ...sql,
                                ordering: [newOrder]
                            }]
                        });
                    }
                })
        );
    });
}

export function distinct<s, a>(quer: Query<s, a>): Query<s, a> {
    return new Query(resolve => {
        resolve(
            State.bind(
                isolate(quer),
                i => {
                    const [inner_st, res] = i;
                    return State.bind(
                        State.get(),
                        st => State.bind(
                            (
                                inner_st.sources.length === 1
                                    ? State.put({
                                        ...st,
                                        sources: [{
                                            ...inner_st.sources[0],
                                            distinct: true
                                        }]
                                    })
                                    : State.put({
                                        ...st,
                                        sources: [sqlFrom(allCols(inner_st.sources), {
                                            type: "Product",
                                            sqls: inner_st.sources
                                        })]
                                    })
                            ),
                            () => State.pure(res)
                        )

                    );
                }
            )
        );
    });
}

export function count<s, a>(col: Col<s, a>): Aggr<s, number> {
    return <any>{
        type: "EAggrEx",
        name: "COUNT",
        exp: colUnwrap(col),
        parser: SqlType.numberParser
    };
}

export function avg<s>(col: Col<s, number>): Aggr<s, number> {
    return <any>{
        type: "EAggrEx",
        name: "AVG",
        exp: colUnwrap(col),
        parser: SqlType.numberParser
    };
}

export function sum<s>(col: Col<s, number>): Aggr<s, number> {
    return <any>{
        type: "EAggrEx",
        name: "SUM",
        exp: colUnwrap(col),
        parser: SqlType.numberParser
    };
}

export function max<s, a>(col: Col<s, a>): Aggr<s, a> {
    return <any>{
        type: "EAggrEx",
        name: "MAX",
        exp: colUnwrap(col),
        parser: (<any>colUnwrap(col)).parser
    };
}

export function min<s, a>(col: Col<s, a>): Aggr<s, a> {
    return <any>{
        type: "EAggrEx",
        name: "MIN",
        exp: colUnwrap(col),
        parser: (<any>colUnwrap(col)).parser
    };
}

export function inList<s, a>(lhs: Col<s, a>, rhs: Col<s, a>[]): Col<s, boolean> {
    if (rhs.length === 0) {
        return colWrap({
            type: "ELit",
            lit: {
                type: "LBool",
                value: false
            },
            parser: SqlType.booleanParser
        });
    } else {
        return <any>colWrap({
            type: "EInList",
            exp: colUnwrap(lhs),
            exps: <any>rhs, // Dangerous but safe!
            parser: SqlType.booleanParser
        });
    }
}

export function inQuery<s, a>(lhs: Col<s, a>, rhs: Query<s, Col<s, a>>): Col<s, boolean> {
    const q2 = queryBind(rhs, x => queryPure({ val: x })); // Column name can be anything, just need to make sure there is only one
    return <any>colWrap({
        type: "EInQuery",
        exp: colUnwrap(lhs),
        sql: compQuery(freshScope(), q2),
        parser: SqlType.booleanParser
    });
}

function wasRenamedIn(predicate: Exp<SQL, boolean>, cs: SomeCol<SQL>[]): boolean {
    const cs2 = someColNames(cs);
    return colNames([{
        type: "Some",
        exp: predicate,
        parser: <any>null
    }]).find(colName => cs2.indexOf(colName) >= 0) !== undefined;
}

function someColNames<a>(someCols: SomeCol<a>[]): ColName[] {
    const results: ColName[] = [];
    for (const someCol of someCols) {
        if (someCol.type === "Named") {
            results.push(someCol.colName);
        }
    }
    return results;
}

function someColNames2<a>(someCols: [SomeCol<a>, string, (val: string) => any][]): [ColName, string, (val: string) => any][] {
    const results: [ColName, string, (val: string) => any][] = [];
    for (const s of someCols) {
        const [someCol, propName, parser] = s;
        if (someCol.type === "Named") {
            results.push([someCol.colName, propName, parser]);
        }
    }
    return results;
}

export class Inner<s> {
    protected dummy: [Inner<s>, s];
}

// This is really Just a Col<s, a>
export class Aggr<s, a> {
    protected dummy: [Aggr<s, a>, s, a];
}

export type LeftCols<S, A> = {
    [P in keyof A]: Col<S, A[P] | null>;
};

export type AggrCols<S, A> = {
    [P in keyof A]: Aggr<Inner<S>, A[P]>;
};

export function leftJoin<s, a extends object>(s: Query<Inner<s>, MakeCols<Inner<s>, a>>, pred: (p: MakeCols<s, a>) => Col<s, boolean>): Query<s, LeftCols<s, a>> {
    return someJoin(JoinType.LeftJoin, pred, s);
}

export function innerJoin<s, a extends object>(s: Query<Inner<s>, MakeCols<Inner<s>, a>>, pred: (p: MakeCols<s, a>) => Col<s, boolean>): Query<s, MakeCols<s, a>> {
    return someJoin(JoinType.InnerJoin, pred, s);
}

/**
 * The actual code for any join.
 */
function someJoin<s, a extends object, a2>(jointype: JoinType, check: any, q: Query<Inner<s>, MakeCols<Inner<s>, a>>): Query<s, a2> {
    const s: State.State<GenState, a2> = State.bind(
        isolate(q),
        is => {
            const [join_st, res] = is; // tslint:disable-line:variable-name
            return State.bind(
                State.mapM(x => State.bind(rename(x[0]), y => State.pure<GenState, [SomeCol<SQL>, string, (val: string) => any]>([y, x[1], x[2]])), fromTup(res)),
                cs => State.bind(
                    State.get(),
                    st => {
                        const nameds = someColNames2(cs);
                        const left = state2sql(st);
                        const right = sqlFrom(cs.map(x => x[0]), {
                            type: "Product",
                            sqls: [state2sql(join_st)]
                        });
                        const on: Col<s, boolean> = check(toTup(nameds, null));
                        let outCols: SomeCol<SQL>[] = [];
                        for (const c of cs) {
                            const c2 = c[0];
                            if (c2.type === "Named") {
                                outCols.push({
                                    type: "Some",
                                    exp: {
                                        type: "ECol",
                                        correlation: null,
                                        colName: c2.colName,
                                        parser: c2.parser
                                    },
                                    parser: c2.parser
                                });
                            }
                        }
                        outCols = outCols.concat(allCols([left]));
                        return State.bind(
                            State.put({
                                ...st,
                                sources: [sqlFrom(outCols, {
                                    type: "Join",
                                    joinType: jointype,
                                    exp: colUnwrap(on),
                                    left: left,
                                    right: right
                                })]
                            }),
                            () => State.pure(toTup(nameds, null))
                        );
                    }
                )
            );
        }
    );
    return new Query(resolve => {
        resolve(s);
    });
}

function fromTup<a extends object>(c: MakeCols<any, a>): [SomeCol<SQL>, string, (val: string) => any][] {
    const keys = Object.keys(c);
    const result: [SomeCol<SQL>, string, (val: string) => any][] = [];
    for (const key of keys) {
        const col: Col<any, any> = (<any>c)[key];
        const exp = colUnwrap(col);
        result.push([{
            type: "Some",
            exp: exp,
            parser: exp.parser
        }, key, exp.parser]);
        // TODO we might need to set propName here
    }
    return result;
}

export function toTup<a>(colNames: [ColName, string, (val: string) => any][], correlation: TableName | null): a {
    const results: any = {};
    for (const c of colNames) {
        const [colName, propName, parser] = c;
        results[propName] = colWrap({
            type: "ECol",
            correlation: correlation,
            colName: colName,
            parser: parser
        });
    }
    return results;
}

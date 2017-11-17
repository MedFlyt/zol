import { assertNever } from "../assertNever";
import { BinOp, Exp, SomeCol, UnOp } from "../Exp";
import { defaultValue } from "../Query";
import { JoinType, Order, Param, SQL, SqlSource } from "../SQL";
import { Lit } from "../SqlType";
import * as State from "../StateMonad";
import { ColName, fromColName, fromTableName, TableName } from "../Types";

/**
 * SQL pretty-printer. The state is the list of SQL parameters to the
 * prepared statement.
 */
type PP<a> = State.State<PPState, a>;

export interface PPState {
    ppParams: Param[];
    ppTables: TableName[];
    ppParamNS: number;
    ppQueryNS: number;
}

/**
 * Run a pretty-printer.
 */
function runPP(pp: PP<string>): [TableName[], string, Param[]] {
    const [q, st] = pp.runState({
        ppParams: [],
        ppTables: [],
        ppParamNS: 1,
        ppQueryNS: 0
    });
    const tables = st.ppTables; // TODO remove duplicates
    return [tables, q, st.ppParams.slice().reverse()];
}

/**
 * Compile an SQL AST into a parameterized SQL query.
 */
export function compSql(sql: SQL): [TableName[], string, Param[]] {
    return runPP(ppSql(sql));
}

export function compInsert(tbl: TableName, names: [ColName, string, (val: string) => any][], cs: SomeCol<SQL>[][], conflictTableCols: undefined | ColName[], p: Exp<SQL, boolean> | undefined, cs2: [ColName, SomeCol<SQL>][] | undefined, rs: SomeCol<SQL>[]): [string, Param[]] {
    const [, sql, params] = runPP(State.bind(
        State.mapM(ppInsertRow, cs),
        inserts => State.bind(
            cs2 === undefined ? State.pure(undefined) : State.mapM(ppUpdate, cs2),
            updates => State.bind(
                p === undefined ? State.pure(undefined) : ppCol(p),
                check => State.bind(
                    State.mapM(ppSomeCol, rs),
                    rs2 => {
                        let onConflict: string = "";
                        if (conflictTableCols !== undefined) {
                            onConflict = " ON CONFLICT (" + conflictTableCols.map(fromColName).join(", ") + ")";
                            if (updates === undefined) {
                                onConflict += " DO NOTHING";
                            } else {
                                if (check === undefined) {
                                    throw new Error("The impossible happened");
                                }
                                onConflict += " DO UPDATE SET ";
                                onConflict += set(updates);
                                onConflict += " WHERE ";
                                onConflict += check;
                            }
                        }
                        return State.pure([
                            "INSERT INTO",
                            fromTableName(tbl),
                            "(" + names.map(x => fromColName(x[0])).join(", ") + ")",
                            "VALUES",
                            inserts.map(row => "(" + row.join(", ") + ")").join(", ")
                        ].join(" ") + onConflict + ppReturning(rs2));
                    })
            )
        ))
    );

    return [sql, params];
}

function ppReturning(rs2: string[]): string {
    if (rs2.length === 0) {
        return "";
    }

    let returning = " RETURNING";
    for (let i = 0; i < rs2.length; ++i) {
        if (i > 0) {
            returning += ",";
        }
        returning += " " + rs2[i];
    }
    return returning;
}

function ppInsertRow(cs: SomeCol<SQL>[]): PP<string[]> {
    return State.mapM(ppInsert, cs);
}

function ppInsert(c: SomeCol<SQL>): PP<string> {
    if (c.exp === <any>defaultValue()) {
        return State.pure("DEFAULT");
    } else {
        return ppSomeCol(c);
    }
}

/**
 * Compile an @UPATE@ statement.
 */
export function compUpdate(tbl: TableName, p: Exp<SQL, boolean>, cs: [ColName, SomeCol<SQL>][], rs: SomeCol<SQL>[]): [string, Param[]] {
    const ppUpd: PP<string> = State.bind(
        State.mapM(ppUpdate, cs),
        updates => State.bind(
            ppCol(p),
            check => State.bind(
                State.mapM(ppSomeCol, rs),
                rs2 =>
                    State.pure([
                        "UPDATE", fromTableName(tbl),
                        "SET", set(updates),
                        "WHERE", check
                    ].join(" ") + ppReturning(rs2))
            )
        )
    );
    const [, y, z] = runPP(ppUpd);
    return [y, z];
}

/**
 * Compile a @DELETE@ statement.
 */
export function compDelete(tbl: TableName, p: Exp<SQL, boolean>): [string, Param[]] {
    const ppUpd: PP<string> = State.bind(
        ppCol(p),
        check =>
            State.pure([
                "DELETE FROM", fromTableName(tbl),
                "WHERE", check
            ].join(" "))
    );
    const [, y, z] = runPP(ppUpd);
    return [y, z];
}

// left=false, right=true
function ppUpdate([n, c]: [ColName, SomeCol<SQL>]): PP<[boolean, string]> {
    const n2 = fromColName(n);
    if (c.exp === <any>defaultValue()) {
        return State.pure<PPState, [boolean, string]>([true, n2 + " = DEFAULT"]);
    }
    return State.bind(
        ppSomeCol(c),
        c2 => {
            const upd = n2 + " = " + c2;
            if (n2 === c2) {
                return State.pure<PPState, [boolean, string]>([false, upd]);
            } else {
                return State.pure<PPState, [boolean, string]>([true, upd]);
            }
        });
}

function set(us: [boolean, string][]): string {
    const us2 = us.filter(u => u[0]);
    if (us2.length === 0) {
        // if the update doesn't change anything, pick an arbitrary column to
        // set to itself just to satisfy SQL's syntactic rules
        return set([[true, us[0][1]]]);
    } else {
        return us2.map(x => x[1]).join(", ");
    }
}

function ppSomeCol(c: SomeCol<SQL>): PP<string> {
    switch (c.type) {
        case "Some":
            return ppCol(c.exp);
        case "Named":
            return State.bind
                (
                ppCol(c.exp),
                c2 =>
                    State.pure(c2 + " AS " + fromColName(c.colName))
                );
        /* istanbul ignore next */
        default:
            return assertNever(c);
    }
}

function ppCol<a>(c: Exp<SQL, a>): PP<string> {
    switch (c.type) {
        case "ETblCol":
            throw new Error("compiler bug: ppCol saw TblCol: " + c.colNames);
        case "ECol":
            return State.pure(fromColName(c.colName));
        case "ELit":
            return ppLit(c.lit);
        case "EBinOp":
            return ppBinOp(ppOp(c.op), c.lhs, c.rhs);
        case "ECustomBinOp":
            return ppBinOp(c.op, c.lhs, c.rhs);
        case "EUnOp":
            return ppUnOp(c.op, c.exp);
        case "EFun2":
            return State.bind(
                ppCol(c.lhs),
                a2 => State.bind(
                    ppCol(c.rhs),
                    b2 => State.pure(c.name + "(" + a2 + ", " + b2 + ")")
                )
            );
        case "EFun3":
            return State.bind(
                ppCol(c.col1),
                a2 => State.bind(
                    ppCol(c.col2),
                    b2 => State.bind(
                        ppCol(c.col3),
                        c2 => State.pure(c.name + "(" + a2 + ", " + b2 + ", " + c2 + ")")
                    )
                )
            );
        case "EFunN":
            return State.bind(
                State.mapM(ppCol, c.cols),
                cs2 => State.pure(c.name + "(" + cs2.join(", ") + ")")
            );
        case "EAggrEx":
            return ppUnOp({
                type: "UFun",
                name: c.name
            }, c.exp);
        case "ECast":
            return State.bind(
                ppCol(c.exp),
                x2 => State.pure("CAST(" + x2 + " AS " + c.sqlType + ")")
            );
        case "EIfThenElse":
            return State.bind(
                ppCol(c.expIf),
                a2 => State.bind(
                    ppCol(c.expThen),
                    b2 => State.bind(
                        ppCol(c.expElse),
                        c2 => State.pure("CASE WHEN " + a2 + " THEN " + b2 + " ELSE " + c2 + " END")
                    )
                )
            );
        case "ERaw":
            return State.bind(
                State.mapM(ppCol, c.fragments.filter(f => typeof f !== "string")),
                cs2 => {
                    let str = "";
                    let i = 0;
                    for (const f of c.fragments) {
                        if (typeof f === "string") {
                            str += f;
                        } else {
                            str += cs2[i];
                            i++;
                        }
                    }
                    return State.pure(str);
                }
            );
        case "EInList":
            return State.bind(
                ppCol(c.exp),
                x2 => State.bind(
                    State.mapM(ppCol, c.exps),
                    xs2 => State.pure(x2 + " IN (" + xs2.join(", ") + ")")
                )
            );
        case "EInQuery":
            return State.bind(
                ppCol(c.exp),
                x2 => State.bind(
                    ppSql(c.sql),
                    q2 => State.pure(x2 + " IN (" + q2 + ")")
                )
            );
        case "EExists":
            return State.bind(
                ppSql(c.sql),
                q2 => State.pure("EXISTS (" + q2 + ")")
            );
        /* istanbul ignore next */
        default:
            return assertNever(c);
    }
}

function ppUnOp<a>(op: UnOp, c: Exp<SQL, a>): PP<string> {
    return State.bind(
        ppCol(c),
        c2 => {
            switch (op.type) {
                case "UAbs":
                    return State.pure("ABS(" + c2 + ")");
                case "USgn":
                    return State.pure("SIGN(" + c2 + ")");
                case "UNeg":
                    return State.pure("-(" + c2 + ")");
                case "UNot":
                    return State.pure("NOT(" + c2 + ")");
                case "UIsNull":
                    return State.pure("(" + c2 + ") IS NULL");
                case "UFun":
                    return State.pure(op.name + "(" + c2 + ")");
                /* istanbul ignore next */
                default:
                    return assertNever(op);
            }
        }
    );
}

/**
 * Pretty-print a literal as a named parameter and save the
 * name-value binding in the environment.
 */
function ppLit(l: Lit): PP<string> {
    switch (l.type) {
        case "LNull":
            return State.pure("NULL");
        // TODO "LJust" ???
        default:
            return State.bind
                (
                State.get(),
                pp => {
                    const p2: Param = {
                        param: l
                    };
                    return State.bind
                        (State.put({
                            ppParams: [p2].concat(pp.ppParams),
                            ppTables: pp.ppTables,
                            ppParamNS: pp.ppParamNS + 1,
                            ppQueryNS: pp.ppQueryNS
                        }),
                        () =>
                            State.pure("$" + pp.ppParamNS)
                        );
                }
                );
    }
}

function dependOn(tableName: TableName): PP<void> {
    return State.bind
        (
        State.get(),
        pp => State.put({
            ppParams: pp.ppParams,
            ppTables: [tableName].concat(pp.ppTables),
            ppParamNS: pp.ppParamNS,
            ppQueryNS: pp.ppQueryNS
        })
        );
}

/**
 * Generate a unique name for a subquery.
 */
function freshQueryName(): PP<string> {
    return State.bind
        (
        State.get(),
        pp =>
            State.bind
                (
                State.put({
                    ppParams: pp.ppParams,
                    ppTables: pp.ppTables,
                    ppParamNS: pp.ppParamNS,
                    ppQueryNS: pp.ppQueryNS + 1
                }),
                () =>
                    State.pure("q" + pp.ppQueryNS)
                )
        );
}

/**
 * Pretty-print an SQL AST.
 */
function ppSql(sql: SQL): PP<string> {
    return State.bind
        (
        State.mapM(ppSomeCol, sql.cols),
        cs2 =>
            State.bind(
                ppSrc(sql.source),
                src2 => State.bind(
                    ppRestricts(sql.restricts),
                    r2 => State.bind(
                        ppGroups(sql.groups),
                        gs2 => State.bind(
                            ppOrder(sql.ordering),
                            ord2 => State.bind(
                                ppLimit(sql.limits),
                                lim2 => {
                                    const result = (cs: string[]): string => {
                                        if (cs.length === 0) {
                                            return "1";
                                        } else {
                                            return cs.join(", ");
                                        }
                                    };

                                    return State.pure(
                                        "SELECT " + (sql.distinct ? "DISTINCT " : "") + result(cs2) +
                                        src2 +
                                        r2 +
                                        gs2 +
                                        ord2 +
                                        lim2
                                    );
                                }
                            )
                        )))));
}

function ppSrc(s: SqlSource): PP<string> {
    switch (s.type) {
        case "EmptyTable":
            return State.bind
                (
                freshQueryName(),
                qn =>
                    State.pure(" FROM (SELECT NULL LIMIT 0) AS " + qn)
                );
        case "TableName":
            return State.bind
                (dependOn(s.tableName),
                () => State.pure(" FROM " + fromTableName(s.tableName))
                );
        case "Product":
            if (s.sqls.length === 0) {
                return State.pure("");
            } else {
                return State.bind(
                    State.mapM(s => ppSql(s), s.sqls.slice().reverse()),
                    srcs => State.bind(
                        State.mapM(
                            q => State.bind(
                                freshQueryName(),
                                qn => State.pure(q + " AS " + qn)
                            ),
                            srcs.map(s => "(" + s + ")")),
                        qs => State.pure(" FROM " + qs.join(", "))
                    )
                );
            }
        case "Values":
            return State.bind(
                State.mapM(ppSomeCol, s.cols),
                row2m => {
                    const row2 = row2m.join(", ");
                    return State.bind(
                        State.mapM(ppRow, s.params),
                        rows2 => State.bind(
                            freshQueryName(),
                            qn => State.pure(
                                " FROM (SELECT "
                                + ([row2].concat(rows2)).join(" UNION ALL SELECT ")
                                + ") AS "
                                + qn
                            )
                        )
                    );
                }
            );
        case "Join":
            return State.bind(
                ppSql(s.left),
                l2 => State.bind(
                    ppSql(s.right),
                    r2 => State.bind(
                        ppCol(s.exp),
                        on2 => State.bind(
                            freshQueryName(),
                            lqn => State.bind(
                                freshQueryName(),
                                rqn => State.pure(
                                    " FROM (" + l2 + ") AS " + lqn
                                    + " " + ppJoinType(s.joinType) + " (" + r2 + ") AS " + rqn
                                    + " ON " + on2
                                )
                            )
                        )
                    )
                )
            );
        /* istanbul ignore next */
        default:
            return assertNever(s);
    }
}

function ppRow(xs: SomeCol<SQL>[]): PP<string> {
    const pps: PP<string>[] = [];
    for (const x of xs) {
        pps.push(ppCol(x.exp));
    }
    return State.bind(
        State.sequence(pps),
        ls => State.pure(ls.join(", "))
    );
}

function ppRestricts(rs: Exp<SQL, boolean>[]): PP<string> {
    if (rs.length === 0) {
        return State.pure("");
    } else {
        return State.bind(
            ppCols(rs),
            rs2 => State.pure(" WHERE " + rs2)
        );
    }
}

function ppGroups(grps: SomeCol<SQL>[]): PP<string> {
    if (grps.length === 0) {
        return State.pure("");
    } else {
        const somes: PP<string>[] = [];
        for (const g of grps) {
            if (g.type === "Some") {
                somes.push(ppCol(g.exp));
            }
        }
        return State.bind(
            State.sequence(somes),
            cls => State.pure(" GROUP BY " + cls.join(", "))
        );
    }
}

function ppOrder(os: [Order, SomeCol<SQL>][]): PP<string> {
    if (os.length === 0) {
        return State.pure("");
    } else {
        const somes = os.filter(x => x[1].type === "Some");
        return State.bind(
            State.sequence(somes.map(o => State.bind(ppCol(o[1].exp), s => State.pure(s + " " + ppOrd(o[0]))))),
            os2 => State.pure(" ORDER BY " + os2.join(", "))
        );
    }
}

function ppOrd(order: Order): string {
    switch (order) {
        case Order.Asc:
        case Order.AscNullsLast:
            return "ASC";
        case Order.Desc:
        case Order.DescNullsFirst:
            return "DESC";
        case Order.AscNullsFirst:
            return "ASC NULLS FIRST";
        case Order.DescNullsLast:
            return "DESC NULLS LAST";
        /* istanbul ignore next */
        default:
            return assertNever(order);
    }
}

function ppLimit(lim: [number, number] | null): PP<string> {
    if (lim === null) {
        return State.pure("");
    } else {
        const [off, limi] = lim;
        return State.pure(" LIMIT " + limi + (off === 0 ? "" : " OFFSET " + off));
    }
}

function ppCols(cs: Exp<SQL, boolean>[]): PP<string> {
    return State.bind(
        State.mapM(ppCol, cs.slice().reverse()),
        cs2 => State.pure("(" + cs2.join(") AND (") + ")")
    );
}

function ppBinOp<a>(opString: string, lhs: Exp<SQL, a>, rhs: Exp<SQL, a>): PP<string> {
    return State.bind(
        ppCol(lhs),
        lhs2 => State.bind(
            ppCol(rhs),
            rhs2 => State.pure(paren(lhs, lhs2) + " " + opString + " " + paren(rhs, rhs2))
        )
    );
}

function paren<a>(z: Exp<SQL, a>, c: string): string {
    if (z.type === "ECol" || z.type === "ELit") {
        return c;
    } else {
        return "(" + c + ")";
    }
}

function ppOp(op: BinOp): string {
    switch (op) {
        case BinOp.Gt:
            return ">";
        case BinOp.Lt:
            return "<";
        case BinOp.Gte:
            return ">=";
        case BinOp.Lte:
            return "<=";
        case BinOp.Eq:
            return "=";
        case BinOp.Neq:
            return "!=";
        case BinOp.And:
            return "AND";
        case BinOp.Or:
            return "OR";
        case BinOp.Add:
            return "+";
        case BinOp.Sub:
            return "-";
        case BinOp.Mul:
            return "*";
        case BinOp.Div:
            return "/";
        case BinOp.Concat:
            return "||";
        case BinOp.Like:
            return "LIKE";
        case BinOp.ILike:
            return "ILIKE";
        /* istanbul ignore next */
        default:
            return assertNever(op);
    }
}

function ppJoinType(j: JoinType): string {
    switch (j) {
        case JoinType.LeftJoin:
            return "LEFT JOIN";
        case JoinType.InnerJoin:
            return "JOIN";
        /* istanbul ignore next */
        default:
            return assertNever(j);
    }
}

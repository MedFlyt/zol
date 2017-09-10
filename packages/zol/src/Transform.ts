import { assertNever } from "./assertNever";
import { SomeCol } from "./Exp";
import { GenState } from "./GenState";
import { allNamesInExp } from "./Names";
import { SQL } from "./SQL";
import { ColName } from "./Types";

/**
 * Remove all dead columns recursively, assuming that the given list of
 * column names contains all names present in the final result.
 */
export function removeDeadCols(live: ColName[], sql: SQL): SQL {
    const sql2 = keepCols(allNonOutputColNames(sql).concat(live), sql);
    const live2 = allColNames(sql2);
    const noDead = (x: SQL) => removeDeadCols(live2, x);
    switch (sql2.source.type) {
        case "EmptyTable":
            return sql2;
        case "TableName":
            return sql2;
        case "Values":
            return sql2;
        case "Product":
            return {
                ...sql2,
                source: {
                    type: "Product",
                    sqls: sql2.source.sqls.map(noDead)
                }
            };
        case "Join":
            return {
                ...sql2,
                source: {
                    type: "Join",
                    joinType: sql2.source.joinType,
                    exp: sql2.source.exp,
                    left: noDead(sql2.source.left),
                    right: noDead(sql2.source.right)
                }
            };
        /* istanbul ignore next */
        default:
            return assertNever(sql2.source);
    }
}

/**
 * Return the names of all columns in the given top-level query.
 * Subqueries are not traversed.
 */
export function allColNames(sql: SQL): ColName[] {
    return colNames(sql.cols).concat(allNonOutputColNames(sql));
}


/**
 * Return the names of all non-output (i.e. 'cols') columns in the given
 * top-level query. Subqueries are not traversed.
 */
export function allNonOutputColNames(sql: SQL): ColName[] {
    let result: ColName[] = [];

    const l1 = sql.restricts.map(allNamesInExp).reduce((a, b) => a.concat(b), []);
    result = result.concat(l1);

    const l2 = colNames(sql.groups);
    result = result.concat(l2);

    const l3 = colNames(sql.ordering.map(x => x[1]));
    result = result.concat(l3);

    if (sql.source.type === "Join") {
        const l4 = allNamesInExp(sql.source.exp);
        result = result.concat(l4);
    }

    return result;
}

export function colNames(cs: SomeCol<SQL>[]): ColName[] {
    let result: ColName[] = [];
    for (const c of cs) {
        switch (c.type) {
            case "Named":
                result = result.concat(allNamesInExp(c.exp));
                result.push(c.colName);
                break;
            case "Some":
                result = result.concat(allNamesInExp(c.exp));
                break;
            /* istanbul ignore next */
            default:
                return assertNever(c);
        }
    }
    return result;
}


/**
 * Remove all columns but the given, named ones and aggregates, from a query's
 * list of outputs.
 * If we want to refer to a column in an outer query, it must have a name.
 * If it doesn't, then it's either not referred to by an outer query, or
 * the outer query duplicates the expression, thereby referring directly
 * to the names of its components.
 */
export function keepCols(live: ColName[], sql: SQL): SQL {
    function oneOf(x: SomeCol<SQL>): boolean {
        switch (x.type) {
            case "Some":
                switch (x.exp.type) {
                    case "EAggrEx":
                        return true;
                    case "ECol":
                        return live.indexOf(x.exp.colName) >= 0;
                    default:
                        return false;
                }
            case "Named":
                if (x.exp.type === "EAggrEx") {
                    return true;
                } else {
                    return live.indexOf(x.colName) >= 0;
                }
            /* istanbul ignore next */
            default:
                return assertNever(x);
        }
    }
    return {
        ...sql,
        cols: sql.cols.filter(oneOf)
    };
}

/**
 * Build the outermost query from the SQL generation state.
 * Groups are ignored, as they are only used by 'aggregate'.
 */
export function state2sql(g: GenState): SQL {
    if (g.sources.length === 1) {
        return {
            ...g.sources[0],
            restricts: (g.sources[0].restricts).concat(g.staticRestricts)
        };
    } else {
        return {
            cols: allCols(g.sources),
            source: {
                type: "Product",
                sqls: g.sources
            },
            restricts: g.staticRestricts,
            groups: [],
            ordering: [],
            limits: null,
            distinct: false
        };
    }
}

/**
 * Get all output columns from a list of SQL ASTs.
 */
export function allCols(sqls: SQL[]): SomeCol<SQL>[] {
    const result: SomeCol<SQL>[] = [];
    for (const sql of sqls) {
        for (const col of sql.cols) {
            result.push(outCol(col));
        }
    }
    return result;
}

function outCol(s: SomeCol<SQL>): SomeCol<SQL> {
    if (s.type === "Named") {
        return {
            type: "Some",
            exp: {
                type: "ECol",
                colName: s.colName,
                parser: s.parser
            },
            parser: s.parser
        };
    } else {
        return s;
    }
}

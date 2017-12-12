import { Col, colUnwrap } from "./Column";
import { SomeCol } from "./Exp";
import { GenState, Scope } from "./GenState";
import { ConflictTarget, conflictTargetTableColumns } from "./OnConflict";
import { MakeCols, MakeTable, toTup, Write } from "./Query";
import { Query, runQueryM } from "./Query/Type";
import { Param, SQL } from "./SQL";
import { compDelete, compInsert, compUpdate } from "./SQL/Print";
import { Table } from "./Table";
import { allNonOutputColNames, colNames, removeDeadCols, state2sql } from "./Transform";
import { ColName } from "./Types";

/**
 * Compile a query to an SQL AST.
 *
 * Groups are ignored, as they are only used by `aggregate`.
 */
export function compQuery<a>(scope: Scope, q: Query<any, a>): [number, SQL] {
    const [cs, st] = runQueryM(scope, q);
    return compQuery2(cs, st);
}

export function compQuery2<a>(cs: a, st: GenState): [number, SQL] {
    const final = finalCols(<any>cs);
    const sql = state2sql(st);
    const live = colNames(final).concat(allNonOutputColNames(sql));
    const srcs = removeDeadCols(live, sql);
    const n: number = st.nameSupply;
    const s: SQL = {
        cols: final,
        source: {
            type: "Product",
            sqls: [srcs]
        },
        restricts: [],
        groups: [],
        ordering: [],
        limits: null,
        distinct: false
    };
    return [n, s];
}

let scopeSupply: Scope = 1;

export function freshScope(): Scope {
    scopeSupply++;
    return scopeSupply - 1;
}

export function resetScope(): void {
    scopeSupply = 1;
}

/**
 * @param cols object whose fields are all of type Col<s, a>
 */
export function finalCols<s, a>(cols: object): SomeCol<SQL>[] {
    const result: SomeCol<SQL>[] = [];
    const keys = Object.keys(cols);
    keys.sort();
    for (const key of keys) {
        const col: Col<s, a> = (<any>cols)[key];
        result.push({
            type: "Some",
            exp: colUnwrap(col),
            parser: (<any>colUnwrap(col)).parser
        });

        // This is needed so that we later know which propNames to use when
        // constructing the results of a query. (See the `query` function)
        (<any>result[result.length - 1]).propName = key;
    }
    return result;
}

export function compileInsert<a extends object, b extends object, c extends object>(tbl: Table<any, any>, rowValues: MakeTable<a, b>[], conflictTarget: ConflictTarget<a & b> | undefined, conflictAction: [(c: MakeCols<Write, a>) => Col<Write, boolean>, (c: MakeCols<Write, a>) => MakeTable<a, b>] | undefined, returning: (c: MakeCols<Write, a & b>) => MakeCols<Write, c>): [string, Param[]] {
    const names = tbl.tableCols.map<[ColName, string, (val: string) => any]>(x => [x.name, x.propName, x.parser]);
    const cs = <any>toTup(names); // tslint:disable-line:no-unnecessary-type-assertion
    const fs = rowValues.map(finalCols);
    const rs = finalCols(returning(cs));

    if (conflictTarget === undefined) {
        return compInsert(tbl.tableName, names, fs, undefined, undefined, undefined, rs);
    } else {
        const conflictTblCols = conflictTargetTableColumns(conflictTarget, tbl);
        if (conflictAction === undefined) {
            return compInsert(tbl.tableName, names, fs, conflictTblCols, undefined, undefined, rs);
        } else {
            const [check, upd] = conflictAction;

            const names = tbl.tableCols.map<[ColName, string, (val: string) => any]>(x => [x.name, x.propName, x.parser]);
            const cs = toTup<a>(names);
            const updated: [ColName, SomeCol<SQL>][] = [];
            const fs2 = finalCols(upd(cs));
            for (let i = 0; i < names.length; ++i) {
                updated.push([
                    names[i][0],
                    fs2[i]
                ]);
            }
            const predicate = colUnwrap(check(cs));
            return compInsert(tbl.tableName, names, fs, conflictTblCols, predicate, updated, rs);
        }
    }
}

export function compileUpdate<a extends object, b extends object, c extends object>(tbl: Table<a, b>, check: (c: MakeCols<Write, a>) => Col<Write, boolean>, upd: (c: MakeCols<Write, a>) => MakeTable<a, b>, returning: ((c: MakeCols<Write, a & b>) => MakeCols<Write, c>) | undefined): [string, Param[]] {
    const names = tbl.tableCols.map<[ColName, string, (val: string) => any]>(x => [x.name, x.propName, x.parser]);
    const cs = toTup<a>(names);
    const updated: [ColName, SomeCol<SQL>][] = [];
    const fs = finalCols(upd(cs));
    for (let i = 0; i < names.length; ++i) {
        updated.push([
            names[i][0],
            fs[i]
        ]);
    }
    const predicate = colUnwrap(check(cs));
    if (returning === undefined) {
        return compUpdate(tbl.tableName, predicate, updated, []);
    } else {
        const cs = <any>toTup(names); // tslint:disable-line:no-unnecessary-type-assertion
        const rs = finalCols(returning(cs));
        return compUpdate(tbl.tableName, predicate, updated, rs);
    }
}

export function compileDelete<a extends object, b extends object>(tbl: Table<a, b>, check: (c: MakeCols<Write, a>) => Col<Write, boolean>): [string, Param[]] {
    const names = tbl.tableCols.map<[ColName, string, (val: string) => any]>(x => [x.name, x.propName, x.parser]);
    const cs = toTup<a>(names);
    const predicate = colUnwrap(check(cs));
    return compDelete(tbl.tableName, predicate);
}

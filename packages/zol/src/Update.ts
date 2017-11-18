import { Col } from "./Column";
import { compileUpdate, finalCols } from "./Compile";
import { runCustomQuery } from "./CustomQuery";
import { litToPgParam } from "./Frontend";
import { pg } from "./pg";
import { MakeCols, MakeTable, toTup, Write } from "./Query";
import { Table } from "./Table";
import { ColName } from "./Types";

/**
 * Update rows of a table, with a RETURNING clause
 * @param pred Which rows should be updated (the WHERE clause)
 * @param upd A function that returns the new values for a row.
 *
 *            You may use [[defaultValue]] on "default-able" columns.
 *
 *            Should have an explicit annotation of the return type, in order to catch excess properties.
 *            See: <https://github.com/Microsoft/TypeScript/issues/7547#issuecomment-218017839>
 */
export async function updateReturning<Req extends object, Def extends object, Ret extends object>(conn: pg.Client, table: Table<Req, Def>, pred: (c: MakeCols<Write, Req & Def>) => Col<Write, boolean>, upd: (c: MakeCols<Write, Req & Def>) => MakeTable<Req, Def>, returning: (c: MakeCols<Write, Req & Def>) => MakeCols<Write, Ret>): Promise<Ret[]> {
    // TODO Make return value of `upd` param a Partial<...> for slightly better ergonomics
    const [sqlText, params] = compileUpdate(table, pred, upd, returning);
    const pgParams = params.map(x => litToPgParam(x.param));

    const names = table.tableCols.map<[ColName, string, (val: string) => any]>(x => [x.name, x.propName, x.parser]);
    const cs = <any>toTup(names); // tslint:disable-line:no-unnecessary-type-assertion
    const rs = finalCols(returning(cs));

    const rows = await runCustomQuery(conn, rs.map((r: any) => r.propName), rs.map((r: any) => r.parser), sqlText, pgParams);
    return rows;
}

/**
 * Update rows of a table
 *
 * @param pred Which rows should be updated (the WHERE clause)
 * @param upd A function that returns the new values for a row.
 *
 *            You may use [[defaultValue]] on "default-able" columns.
 *
 *            Should have an explicit annotation of the return type, in order to catch excess properties.
 *            See: <https://github.com/Microsoft/TypeScript/issues/7547#issuecomment-218017839>
 * @return number of rows updated
 */
export async function update<Req extends object, Def extends object>(conn: pg.Client, table: Table<Req, Def>, pred: (c: MakeCols<Write, Req & Def>) => Col<Write, boolean>, upd: (c: MakeCols<Write, Req & Def>) => MakeTable<Req, Def>): Promise<number> {
    // TODO Make return value of `upd` param a Partial<...> for slightly better ergonomics
    const [sqlText, params] = compileUpdate(table, pred, upd, undefined);
    const pgParams = params.map(x => litToPgParam(x.param));
    const result = await pg.query(conn, sqlText, pgParams);
    return result.rowCount;
}

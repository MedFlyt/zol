import { Col } from "./Column";
import { compileDelete } from "./Compile";
import { litToPgParam } from "./Frontend";
import { pg } from "./pg";
import { MakeCols, Write } from "./Query";
import { Table } from "./Table";

/**
 * Delete rows of a table
 *
 * @param pred Which rows should be deleted (the WHERE clause)
 * @return number of rows deleted
 */
export async function delete_<Req extends object, Def extends object>(conn: pg.Client, table: Table<Req, Def>, pred: (c: MakeCols<Write, Req & Def>) => Col<Write, boolean>): Promise<number> {
    const [sqlText, params] = compileDelete(table, pred);
    const pgParams = params.map(x => litToPgParam(x.param));
    const result = await pg.query(conn, sqlText, pgParams);
    return result.rowCount;
}

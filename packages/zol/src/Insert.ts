import { Col } from "./Column";
import { compileInsert, finalCols } from "./Compile";
import { runCustomQuery } from "./CustomQuery";
import { litToPgParam } from "./Frontend";
import { ConflictTarget } from "./OnConflict";
import { pg } from "./pg";
import { MakeCols, MakeTable, toTup, Write } from "./Query";
import { Table } from "./Table";
import { ColName } from "./Types";

/**
 * Insert a single row into a table, with a RETURNING clause
 */
export async function insertReturning<Req extends object, Def extends object, Ret extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>, returning: (c: MakeCols<Write, Req & Def>) => MakeCols<Write, Ret>): Promise<Ret> {
    const inserted = await insertManyReturning(conn, table, [rowValues], returning);
    /* istanbul ignore if */
    if (inserted.length !== 1) {
        throw new Error("The Impossible Happened. INSERT expected to return one row, but returned " + inserted.length);
    }

    return inserted[0];
}

/**
 * Insert a single row into a table
 */
export async function insert<Req extends object, Def extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>): Promise<void> {
    await insertMany(conn, table, [rowValues]);
}

/**
 * Insert a single row into a table, with an ON CONFLICT DO NOTHING clause, and with a RETURNING clause
 */
export async function insertOnConflictDoNothingReturning<Req extends object, Def extends object, Ret extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>, conflictTarget: ConflictTarget<Req & Def>, returning: (c: MakeCols<Write, Req & Def>) => MakeCols<Write, Ret>): Promise<Ret> {
    conn; // tslint:disable-line:no-unused-expression
    table; // tslint:disable-line:no-unused-expression
    rowValues; // tslint:disable-line:no-unused-expression
    conflictTarget; // tslint:disable-line:no-unused-expression
    returning; // tslint:disable-line:no-unused-expression
    throw new Error("TODO");
}

/**
 * Insert a single row into a table, with an ON CONFLICT DO NOTHING clause
 *
 * @return true if the row was inserted
 */
export async function insertOnConflictDoNothing<Req extends object, Def extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>, conflictTarget: ConflictTarget<Req & Def>): Promise<boolean> {
    const numRows = await insertManyOnConflictDoNothing(conn, table, [rowValues], conflictTarget);
    return numRows === 1;
}

/**
 * Insert a single row into a table, with an ON CONFLICT DO UPDATE clause, and with a RETURNING clause
 */
export async function insertOnConflictDoUpdateReturning<Req extends object, Def extends object, Ret extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>, conflictTarget: ConflictTarget<Req & Def>, onConflictPred: (c: MakeCols<Write, Req & Def>) => Col<Write, boolean>, onConflictUpdate: (c: MakeCols<Write, Req & Def>/* TODO: , excluded: MakeCols<Write, Req & Def>*/) => MakeTable<Req, Def>, returning: (c: MakeCols<Write, Req & Def>) => MakeCols<Write, Ret>): Promise<Ret> {
    conn; // tslint:disable-line:no-unused-expression
    table; // tslint:disable-line:no-unused-expression
    rowValues; // tslint:disable-line:no-unused-expression
    conflictTarget; // tslint:disable-line:no-unused-expression
    onConflictPred; // tslint:disable-line:no-unused-expression
    onConflictUpdate; // tslint:disable-line:no-unused-expression
    returning; // tslint:disable-line:no-unused-expression
    throw new Error("TODO");
}

/**
 * Insert a single row into a table, with an ON CONFLICT DO UPDATE clause
 *
 * @param onConflictPred Which rows should be updated (the WHERE clause)
 *
 * @param onConflictUpdate A function that returns the new values for a row.
 *
 *                         You may use [[defaultValue]] on "default-able" columns.
 *
 *                         Should have an explicit annotation of the return type, in order to catch excess properties.
 *                         See: <https://github.com/Microsoft/TypeScript/issues/7547#issuecomment-218017839>
 *
 * @return If a new row was inserted returns true.
 *
 *         If a conflicting row already existed but was updated returns true.
 *
 *         If a conflicting row already existed and was not updated returns false.
 */
export async function insertOnConflictDoUpdate<Req extends object, Def extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>, conflictTarget: ConflictTarget<Req & Def>, onConflictPred: (c: MakeCols<Write, Req & Def>) => Col<Write, boolean>, onConflictUpdate: (c: MakeCols<Write, Req & Def>/* TODO: , excluded: MakeCols<Write, Req & Def>*/) => MakeTable<Req, Def>): Promise<boolean> {
    const numRows = await insertManyOnConflictDoUpdate(conn, table, [rowValues], conflictTarget, onConflictPred, onConflictUpdate);
    return numRows === 1;
}

// --------------------------------------------------------------------
// insertMany variations:
// --------------------------------------------------------------------

/**
 * Insert multiple rows into a table, with a RETURNING clause
 */
export async function insertManyReturning<Req extends object, Def extends object, Ret extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>[], returning: (c: MakeCols<Write, Req & Def>) => MakeCols<Write, Ret>): Promise<Ret[]> {
    const [sqlText, params] = compileInsert(table, rowValues, undefined, undefined, returning);

    const pgParams = params.map(x => litToPgParam(x.param));


    const names = table.tableCols.map<[ColName, string, (val: string) => any]>(x => [x.name, x.propName, x.parser]);
    const cs = <any>toTup(names);
    const rs = finalCols(returning(cs));

    const rows = await runCustomQuery(conn, rs.map((r: any) => r.propName), rs.map((r: any) => r.parser), sqlText, pgParams);
    return rows;
}

/**
 * Insert multiple rows into a table
 */
export async function insertMany<Req extends object, Def extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>[]): Promise<void> {
    const [sqlText, params] = compileInsert(table, rowValues, undefined, undefined, () => ({}));

    const pgParams = params.map(x => litToPgParam(x.param));

    await pg.query(conn, sqlText, pgParams);
}

/**
 * Insert multiple rows into a table, with an ON CONFLICT DO NOTHING clause, and with a RETURNING clause
 */
export async function insertManyOnConflictDoNothingReturning<Req extends object, Def extends object, Ret extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>[], conflictTarget: ConflictTarget<Req & Def>, returning: (c: MakeCols<Write, Req & Def>) => MakeCols<Write, Ret>): Promise<Ret[]> {
    conn; // tslint:disable-line:no-unused-expression
    table; // tslint:disable-line:no-unused-expression
    rowValues; // tslint:disable-line:no-unused-expression
    conflictTarget; // tslint:disable-line:no-unused-expression
    returning; // tslint:disable-line:no-unused-expression
    throw new Error("TODO");
}

/**
 * Insert multiple rows into a table, with an ON CONFLICT DO NOTHING clause
 *
 * @return The number of rows inserted
 */
export async function insertManyOnConflictDoNothing<Req extends object, Def extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>[], conflictTarget: ConflictTarget<Req & Def>): Promise<number> {
    const [sqlText, params] = compileInsert(table, rowValues, conflictTarget, undefined, () => ({}));

    const pgParams = params.map(x => litToPgParam(x.param));

    const result = await pg.query(conn, sqlText, pgParams);
    return result.rowCount;
}

/**
 * Insert multiple rows into a table, with an ON CONFLICT DO UPDATE clause, and with a RETURNING clause
 */
export async function insertManyOnConflictDoUpdateReturning<Req extends object, Def extends object, Ret extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>[], conflictTarget: ConflictTarget<Req & Def>, onConflictPred: (c: MakeCols<Write, Req & Def>) => Col<Write, boolean>, onConflictUpdate: (c: MakeCols<Write, Req & Def>/* TODO: , excluded: MakeCols<Write, Req & Def>*/) => MakeTable<Req, Def>, returning: (c: MakeCols<Write, Req & Def>) => MakeCols<Write, Ret>): Promise<Ret[]> {
    conn; // tslint:disable-line:no-unused-expression
    table; // tslint:disable-line:no-unused-expression
    rowValues; // tslint:disable-line:no-unused-expression
    conflictTarget; // tslint:disable-line:no-unused-expression
    onConflictPred; // tslint:disable-line:no-unused-expression
    onConflictUpdate; // tslint:disable-line:no-unused-expression
    returning; // tslint:disable-line:no-unused-expression
    throw new Error("TODO");
}

/**
 * Insert multiple rows into a table, with an ON CONFLICT DO UPDATE clause
 *
 * @param onConflictPred Which rows should be updated (the WHERE clause)
 *
 * @param onConflictUpdate A function that returns the new values for a row.
 *
 *                         You may use [[defaultValue]] on "default-able" columns.
 *
 *                         Should have an explicit annotation of the return type, in order to catch excess properties.
 *                         See: <https://github.com/Microsoft/TypeScript/issues/7547#issuecomment-218017839>
 *
 * @return The number of newly inserted rows + the number of updated rows
 */
export async function insertManyOnConflictDoUpdate<Req extends object, Def extends object>(conn: pg.Client, table: Table<Req, Def>, rowValues: MakeTable<Req, Def>[], conflictTarget: ConflictTarget<Req & Def>, onConflictPred: (c: MakeCols<Write, Req & Def>) => Col<Write, boolean>, onConflictUpdate: (c: MakeCols<Write, Req & Def>/* TODO: , excluded: MakeCols<Write, Req & Def> */) => MakeTable<Req, Def>): Promise<number> {
    const [sqlText, params] = compileInsert(table, rowValues, conflictTarget, [onConflictPred, onConflictUpdate], () => ({}));

    const pgParams = params.map(x => litToPgParam(x.param));

    const result = await pg.query(conn, sqlText, pgParams);
    return result.rowCount;
}

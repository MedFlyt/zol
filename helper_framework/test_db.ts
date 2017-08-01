import { pg } from "./pg";

/**
 * Starts a new database transaction, runs your action, and then aborts the transaction,
 * without leaving any traces in the database that it was run.
 *
 * Intended to be used for testing.
 */
export async function withEphemeral<A>(conn: pg.Client, action: () => Promise<A>): Promise<A> {
    await pg.query_(conn, "BEGIN");

    let result: A;
    try {
        result = await action();
    } finally {
        await pg.query_(conn, "ROLLBACK");
    }
    return result;
}

export async function withTestDatabase<A>(action: (conn: pg.Client) => Promise<A>): Promise<A> {
    const databaseUrl = process.env["DATABASE_URL"];
    /* istanbul ignore if */
    if (databaseUrl === undefined) {
        throw new Error("DATABASE_URL environment var not set");
    }

    return pg.withPg(databaseUrl, conn => {
        return withEphemeral(conn, async () => {
            return action(conn);
        });
    });
}

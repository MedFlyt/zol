import * as pgLib from "pg";

export namespace pg {
    export type Client = pgLib.Client;

    /**
     * Connect to a PostgreSQL database. You should call `closePg` when you are done.
     *
     * @param connection A PostgreSQL connection string, such as:
     *                   "postgres://myuser:mypassword@localhost:5432/dbname"
     */
    export function connectPg(connection: string): Promise<Client> {
        // TODO Remove <any> cast when this PR is merged: <https://github.com/DefinitelyTyped/DefinitelyTyped/pull/21610>
        const client = new pgLib.Client(<any>connection);
        return new Promise<Client>((resolve, reject) => {
            client.connect(err => {
                if (<boolean>(<any>err)) {
                    reject(err);
                    return;
                }
                resolve(client);
            });
        });
    }

    export function closePg(conn: Client): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            conn.end(err => {
                if (<boolean>(<any>err)) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    /**
     *
     * @param connection See `connectPg`
     * @param action
     */
    export async function withPg<A>(connection: string, action: (conn: Client) => Promise<A>): Promise<A> {
        const conn = await connectPg(connection);
        let result: A;
        try {
            result = await action(conn);
        } finally {
            closePg(conn);
        }
        return result;
    }

    export function query_(conn: Client, queryText: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            conn.query(queryText, (err: Error): void => {
                if (<boolean>(<any>err)) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    export function query(conn: Client, queryText: string, values: any[]): Promise<pgLib.QueryResult> {
        return new Promise<pgLib.QueryResult>((resolve, reject) => {
            const q = {
                text: queryText,
                values: values,
                rowMode: "array"
            };
            conn.query(q, (err: Error, result: pgLib.QueryResult): void => {
                if (<boolean>(<any>err)) {
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }
}

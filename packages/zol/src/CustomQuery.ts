import * as pgLib from "pg";
import { StreamingRows } from "./StreamingRows";

const Cursor = require("pg-cursor"); // tslint:disable-line:no-var-requires no-require-imports

/**
 * Will be thrown during a query, if parsing of a column fails for any of the returned rows
 */
export class ColumnParseError extends Error {
    public readonly query: string;
    public readonly columnValue: string;
    public readonly parseFunction: string;
    public readonly innerError: Error | undefined;

    protected __proto__: Error; // tslint:disable-line:variable-name

    public constructor(message: string, query: string, columnValue: string, parseFunction: string, innerError?: Error) {
        const trueProto = new.target.prototype;
        super(message);

        this.__proto__ = trueProto;

        this.query = query;
        this.columnValue = columnValue;
        this.parseFunction = parseFunction;
        this.innerError = innerError;
    }
}


export function runCustomQuery(conn: pgLib.Client, propNames: string[], propParsers: ((val: string) => any)[], text: string, values: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        const customQuery = new CustomQuery(propNames, propParsers, text, values, (err: any) => {
            if (<boolean>err) {
                err.query = text;
                reject(err);
                return;
            }

            if (customQuery.parseError !== null) {
                reject(new ColumnParseError(
                    customQuery.parseError.message,
                    text,
                    customQuery.parseErrorValue,
                    customQuery.parseErrorParseFunction,
                    customQuery.parseError));
                return;
            }

            resolve(customQuery.rows);
        });
        conn.query(customQuery);
    });
}

const CustomQuery: any = function(this: any, propNames: any, propParsers: any, text: any, values: any, callback: any) {
    pgLib.Query.call(this, text, values, callback);

    this.parseError = null;
    this.propNames = propNames;
    this.propParsers = propParsers;
    this.numFields = this.propNames.length;
    this.rows = [];
};
CustomQuery.prototype = Object.create(pgLib.Query.prototype);
CustomQuery.prototype.constructor = CustomQuery;

CustomQuery.prototype.handleRowDescription = function(this: any) {
    // Ignore
};

CustomQuery.prototype.handleDataRow = function(this: any, msg: any) {
    if (this.parseError !== null) {
        return;
    }

    const newRow: any = {};
    for (let i = 0; i < this.numFields; ++i) {
        // This try block is more broad than necessary.. we only expect
        // an error to happen inside the call to:
        //
        //     this.propParsers[i](..)
        //
        // But it is left as it is for efficiency. The other fragments
        // of code cannot possibly throw an Error (famous last words)
        try {
            newRow[this.propNames[i]] =
                msg.fields[i] !== null
                    ? this.propParsers[i](msg.fields[i])
                    : null;
        } catch (e) {
            this.parseError = e;
            this.parseErrorValue = msg.fields[i];
            this.parseErrorParseFunction = this.propParsers[i].name;
            return;
        }
    }
    this.rows.push(newRow);
};

const CustomCursor: any = function(this: any, propNames: any, propParsers: any, text: any, values: any) {
    Cursor.call(this, text, values);

    this.parseError = null;
    this.propNames = propNames;
    this.propParsers = propParsers;
    this.numFields = this.propNames.length;
};
CustomCursor.prototype = Object.create(Cursor.prototype);
CustomCursor.prototype.constructor = Cursor;

CustomCursor.prototype.handleRowDescription = function(this: any) {
    // Code was taken straight from the original Cursor source code:
    this.state = "idle";
    this._shiftQueue();
};

CustomCursor.prototype.handleDataRow = function(this: any, msg: any) {
    const row: any = {};

    if (this.parseError === null) {
        for (let i = 0; i < this.numFields; ++i) {
            // This try block is more broad than necessary.. we only expect
            // an error to happen inside the call to:
            //
            //     this.propParsers[i](..)
            //
            // But it is left as it is for efficiency. The other fragments
            // of code cannot possibly throw an Error (famous last words)
            try {
                row[this.propNames[i]] =
                    msg.fields[i] !== null
                        ? this.propParsers[i](msg.fields[i])
                        : null;
            } catch (e) {
                this.parseError = e;
                this.parseErrorValue = msg.fields[i];
                this.parseErrorParseFunction = this.propParsers[i].name;
            }
        }
    }

    // Code was taken straight from the original Cursor source code:
    this.emit("row", row, this._result);
    this._rows.push(row);
};


export function runCustomQueryStreaming(conn: pgLib.Client, propNames: string[], propParsers: ((val: string) => any)[], text: string, values: any, rowChunkSize: number): Promise<StreamingRows<any>> {
    return new Promise<StreamingRows<any>>((resolve, reject) => {
        const cursor = conn.query(new CustomCursor(propNames, propParsers, text, values));

        // Read the first batch of results before we return from this function,
        // so that if there is an SQL error it will be thrown here, rather than
        // inside the StreamingRows' "readAllRows"

        cursor.read(rowChunkSize, (err: any, rows: any) => {
            if (<boolean>err) {
                reject(err);
                return;
            }
            if (rows.length === 0) {
                resolve({
                    readAllRows: async (_action: (results: any[]) => Promise<void>): Promise<void> => {
                        return;
                    }
                });
            } else {
                resolve({
                    readAllRows: (action: (results: any[]) => Promise<void>): Promise<void> => {
                        return new Promise<void>((resolve, reject) => {
                            let userError: null | any = null;

                            const next = (err: any, rows: any[]) => {
                                if (<boolean>err) {
                                    reject(err);
                                    return;
                                }
                                if (rows.length === 0) {
                                    if (cursor.parseError !== null) {
                                        reject(new ColumnParseError(
                                            cursor.parseError.message,
                                            text,
                                            cursor.parseErrorValue,
                                            cursor.parseErrorParseFunction,
                                            cursor.parseError));
                                    } else if (userError !== null) {
                                        reject(userError);
                                    } else {
                                        resolve();
                                    }
                                } else {
                                    if (cursor.parseError === null && userError === null) {
                                        action(rows).then(() => {
                                            cursor.read(rowChunkSize, next);
                                        }, (err) => {
                                            userError = err;
                                            cursor.read(rowChunkSize, next);
                                        });
                                    } else {
                                        cursor.read(rowChunkSize, next);
                                    }
                                }
                            };
                            if (cursor.parseError === null) {
                                action(rows).then(() => {
                                    cursor.read(rowChunkSize, next);
                                }, (err) => {
                                    userError = err;
                                    cursor.read(rowChunkSize, next);
                                });
                            } else {
                                cursor.read(rowChunkSize, next);
                            }
                        });
                    }
                });
            }
        });
    });
}

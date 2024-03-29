import * as pgLib from "pg";
import { QueryResult } from "pg";
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

/**
 * Don't do any parsing of Postgres values, just leave them as a string
 */
function identityTypeParser(val: string) {
    return val;
}

export function runCustomQuery(conn: pgLib.Client, propNames: string[], propParsers: ((val: string) => any)[], text: string, values: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        let customTypeParserIgnored = true;

        conn.query({
            text: text,
            values: values,
            rowMode: "array",
            types: {
                getTypeParser: () => (val: string) => {
                    customTypeParserIgnored = false;
                    return val;
                }
            }
        }, (err: any, result: QueryResult) => {
            if (<boolean>err) {
                err.query = text;
                reject(err);
                return;
            }

            const resultRows = result.rows;
            const resultRowsLength = resultRows.length;
            const numFields = propNames.length;

            const rows = [];

            for (let i = 0; i < resultRowsLength; ++i) {
                const row = resultRows[i];
                const newRow: any = {};
                for (let j = 0; j < numFields; ++j) {
                    let colValue = row[j];

                    // "pg" has a bug that it ignores our custom type parser
                    // when using "pg-native":
                    // <https://github.com/brianc/node-postgres/issues/2686>
                    //
                    // Here is a workaround until the bug is fixed
                    if (customTypeParserIgnored && colValue !== null) {
                        switch (result.fields[j].dataTypeID) {
                            case 16: // BOOL
                                colValue = colValue === true ? "t" : "f";
                                break;
                            case 21: // INT2
                            case 23: // INT4
                            case 700: // FLOAT4
                            case 701: // FLOAT8
                            case 1700: // NUMERIC
                                colValue = "" + colValue;
                                break;
                            case 114: // JSON
                            case 3802: // JSONB
                                colValue = JSON.stringify(colValue);
                                break;
                            case 1082: // DATE
                                colValue = formatDate(colValue);
                                break;
                            case 1184: // TIMESTAMPTZ
                                colValue = formatTimestamptz(colValue);
                                break;
                            case 1114: // TIMESTAMP
                                colValue = formatTimestamp(colValue);
                                break;
                            case 1186: // INTERVAL
                                colValue = formatInterval(colValue);
                                break;
                            default:
                                break;
                        }
                    }

                    // This try block is more broad than necessary.. we only expect
                    // an error to happen inside the call to:
                    //
                    //     this.propParsers[i](..)
                    //
                    // But it is left as it is for efficiency. The other fragments
                    // of code cannot possibly throw an Error (famous last words)
                    try {
                        newRow[propNames[j]] =
                            colValue !== null
                                ? propParsers[j](colValue)
                                : null;
                    } catch (e) {
                        reject(new ColumnParseError(
                            e.message,
                            text,
                            row[j],
                            propParsers[j].name,
                            e));
                        return;
                    }
                }
                rows.push(newRow);
            }

            resolve(rows);
        });
    });
}

export function runCustomQueryStreaming(conn: pgLib.Client, propNames: string[], propParsers: ((val: string) => any)[], text: string, values: any, rowChunkSize: number): Promise<StreamingRows<any>> {
    if ((conn as any).native) {
        throw new Error("Streaming not supported when using \"pg-native\" driver");
    }

    function parseRows(resultRows: any[]): any[] {
        const resultRowsLength = resultRows.length;
        const numFields = propNames.length;

        const rows = [];

        for (let i = 0; i < resultRowsLength; ++i) {
            const row = resultRows[i];
            const newRow: any = {};
            for (let j = 0; j < numFields; ++j) {
                const colValue = row[j];
                // This try block is more broad than necessary.. we only expect
                // an error to happen inside the call to:
                //
                //     this.propParsers[i](..)
                //
                // But it is left as it is for efficiency. The other fragments
                // of code cannot possibly throw an Error (famous last words)
                try {
                    newRow[propNames[j]] =
                        colValue !== null
                            ? propParsers[j](colValue)
                            : null;
                } catch (e) {
                    throw new ColumnParseError(
                        e.message,
                        text,
                        row[j],
                        propParsers[j].name,
                        e);
                }
            }
            rows.push(newRow);
        }

        return rows;
    }

    return new Promise<StreamingRows<any>>((resolve, reject) => {
        const cursor = new Cursor(text, values, {
            rowMode: "array",
            types: {
                getTypeParser: () => identityTypeParser
            }
        });

        conn.query(cursor);

        // Read the first batch of results before we return from this function,
        // so that if there is an SQL error it will be thrown here, rather than
        // inside the StreamingRows' "readAllRows"

        cursor.read(rowChunkSize, (err: any, rows: any[]) => {
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
                            const next = (err: any, rows: any[]) => {
                                if (<boolean>err) {
                                    reject(err);
                                    return;
                                }
                                if (rows.length === 0) {
                                    resolve();
                                } else {
                                    let parsedRows;
                                    try {
                                        parsedRows = parseRows(rows);
                                    } catch (err) {
                                        cursor.close(() => {
                                            reject(err);
                                        });
                                        return;
                                    }

                                    action(parsedRows).then(() => {
                                        cursor.read(rowChunkSize, next);
                                    }, (err) => {
                                        cursor.close(() => {
                                            reject(err);
                                        });
                                    });
                                }
                            };

                            let parsedRows;
                            try {
                                parsedRows = parseRows(rows);
                            } catch (err) {
                                cursor.close(() => {
                                    reject(err);
                                });
                                return;
                            }

                            action(parsedRows).then(() => {
                                cursor.read(rowChunkSize, next);
                            }, (err) => {
                                cursor.close(() => {
                                    reject(err);
                                });
                            });
                        });
                    }
                });
            }
        });
    });
}

function formatDate(date: Date): string {
    return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
}

function formatTimestamp(date: Date): string {
    return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}.${threeDigits(date.getMilliseconds())}`;
}

function formatTimestamptz(date: Date): string {
    return `${date.getUTCFullYear()}-${twoDigits(date.getUTCMonth() + 1)}-${twoDigits(date.getUTCDate())} ${twoDigits(date.getUTCHours())}:${twoDigits(date.getUTCMinutes())}:${twoDigits(date.getUTCSeconds())}.${threeDigits(date.getUTCMilliseconds())}`;
}

function formatInterval(interval: any): string {
    let result = "";
    if (interval.years !== undefined) {
        result += `${interval.years} years `;
    }
    if (interval.months !== undefined) {
        result += `${interval.months} months `;
    }
    if (interval.days !== undefined) {
        result += `${interval.days} days `;
    }
    let negativeInterval = false;

    let hours = interval.hours !== undefined ? interval.hours : 0;
    if (hours < 0) {
        negativeInterval = true;
        hours = -hours;
    }

    let minutes = interval.minutes !== undefined ? interval.minutes : 0;
    if (minutes < 0) {
        negativeInterval = true;
        minutes = -minutes;
    }

    let seconds = interval.seconds !== undefined ? interval.seconds : 0;
    if (seconds < 0) {
        negativeInterval = true;
        seconds = -seconds;
    }

    let milliseconds = interval.milliseconds !== undefined ? Math.trunc(interval.milliseconds) : 0;
    if (milliseconds < 0) {
        negativeInterval = true;
        milliseconds = -milliseconds;
    }

    result += `${negativeInterval ? "-" : ""}${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}.${threeDigits(milliseconds)}`;
    result = result.trim();
    return result;
}

function twoDigits(val: number): string {
    if (val <= 9) {
        return "0" + val;
    } else {
        return "" + val;
    }
}

function threeDigits(val: number): string {
    if (val <= 9) {
        return "00" + val;
    } else if (val <= 99) {
        return "0" + val;
    } else {
        return "" + val;
    }
}

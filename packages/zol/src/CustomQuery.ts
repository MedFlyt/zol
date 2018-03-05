import * as pgLib from "pg";

/**
 * Will be thrown during a query, if parsing of a column fails for any of the returned rows
 */
export function ColumnParseError(this: any, message: string, query: string, columnValue: string, parseFunction: string, innerError?: Error) {
    this.name = "ColumnParseError";
    this.message = message;
    this.stack = (new Error()).stack;
    this.query = query;
    this.columnValue = columnValue;
    this.parseFunction = parseFunction;
    this.innerError = innerError;
}

ColumnParseError.prototype = Object.create(Error.prototype);
ColumnParseError.prototype.constructor = ColumnParseError;

export function runCustomQuery(conn: pgLib.Client, propNames: string[], propParsers: ((val: string) => any)[], text: string, values: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        const customQuery = new CustomQuery(propNames, propParsers, text, values, (err: any) => {
            if (<boolean>err) {
                err.query = text;
                reject(err);
                return;
            }

            if (customQuery.parseError !== null) {
                reject(new (<any>ColumnParseError)(
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

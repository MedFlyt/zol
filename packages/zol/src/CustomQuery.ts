import * as pgLib from "pg";

export function runCustomQuery(conn: pgLib.Client, propNames: string[], propParsers: ((val: string) => any)[], text: string, values: any): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        const customQuery = new CustomQuery(propNames, propParsers, text, values, (err: any) => {
            if (<boolean>err) {
                reject(err);
                return;
            }

            resolve(customQuery.rows);
        });
        conn.query(customQuery);
    });
}

const CustomQuery: any = function(this: any, propNames: any, propParsers: any, text: any, values: any, callback: any) {
    pgLib.Query.call(this, text, values, callback);

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
    const newRow: any = {};
    for (let i = 0; i < this.numFields; ++i) {
        newRow[this.propNames[i]] = msg.fields[i] !== null ? this.propParsers[i](msg.fields[i]) : null;
    }
    this.rows.push(newRow);
};

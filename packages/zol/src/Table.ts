import { ColName, TableName } from "./Types";

export class Table<Req, Def> {
    public readonly tableName: TableName;
    public readonly tableCols: ColInfo[];

    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): [Table<Req, Def>, Req, Def] { throw new Error(); }
}

export interface ColInfo {
    name: ColName;
    propName: string;
    parser: (val: string) => any;
}

export declare type TableDeclareCols<T extends object> = {
    [P in keyof T]: [string, (val: string) => T[P]];
};

export function declareTable<Req extends object, Def extends object>(tableName: string, columns: TableDeclareCols<Req & Def>): Table<Req, Def> {
    const keys = Object.keys(columns);
    keys.sort();
    const tableCols: ColInfo[] = [];
    for (const key of keys) {
        tableCols.push({
            propName: key,
            name: ColName.wrap(columns[key][0]),
            parser: columns[key][1]
        });
    }
    return <any>{
        tableName: TableName.wrap(tableName),
        tableCols: tableCols
    };
}

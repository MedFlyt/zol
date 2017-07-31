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

export function declareTable<Req, Def>(tableName: string, columns: [string, keyof (Req & Def), (val: any) => any][]): Table<Req, Def> {
    const tableCols = columns.map(val => {
        const [name, propName, parser] = val;
        return {
            name: ColName.wrap(name),
            propName: propName,
            parser: parser
        };
    });
    tableCols.sort((a, b) => a.propName > b.propName ? 1 : -1);
    return <any>{
        tableName: TableName.wrap(tableName),
        tableCols: tableCols
    };
}

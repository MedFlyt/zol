import { Table } from "./Table";
import { ColName } from "./Types";

export class ConflictTarget<Cols> {
    public static tableColumns<Cols>(cols: (keyof Cols)[]): ConflictTarget<Cols> {
        return <any>{
            tableCols: cols.slice()
        };
    }

    protected dummy: [ConflictTarget<Cols>, Cols];
}

export function conflictTargetTableColumns(conflictTarget: ConflictTarget<any>, table: Table<any, any>): ColName[] {
    const result: ColName[] = [];

    for (const col of (<string[]>(<any>conflictTarget).tableCols)) {
        for (const t of table.tableCols) {
            if (t.propName === col) {
                result.push(t.name);
                break;
            }
        }
    }

    return result;
}

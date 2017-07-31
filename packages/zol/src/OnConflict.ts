import { Table } from "./Table";
import { ColName } from "./Types";

export class ConflictTarget<Cols> {
    public static tableColumns<Cols>(cols: (keyof Cols)[]): ConflictTarget<Cols> {
        return <any>{
            tableCols: cols.slice()
        };
    }

    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): [ConflictTarget<Cols>, Cols] { throw new Error(); }
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

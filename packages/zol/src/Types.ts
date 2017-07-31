export class ColName {
    public static wrap(val: string): ColName {
        return <any>val;
    }

    public static unwrap(val: ColName): string {
        return <any>val;
    }

    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): ColName { throw new Error(); }
}

export class TableName {
    public static wrap(val: string): TableName {
        return <any>val;
    }

    public static unwrap(val: TableName): string {
        return <any>val;
    }

    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): TableName { throw new Error(); }
}


export function addColSuffix(colName: ColName, suffix: string): ColName {
    return ColName.wrap(ColName.unwrap(colName) + suffix);
}

/**
 * Convert a column name into a string, with quotes.
 */
export function fromColName(colName: ColName): string {
    return '"' + ColName.unwrap(colName).replace(/"/g, '""') + '"';
}

/**
 * Convert a table name into a string, with quotes.
 */
export function fromTableName(tableName: TableName): string {
    return '"' + TableName.unwrap(tableName).replace(/"/g, '""') + '"';
}

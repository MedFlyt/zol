import { Exp, SomeCol } from "./Exp";
import { Lit } from "./SqlType";
import * as Types from "./Types";

export interface Param {
    param: Lit;
}

export type SqlSource =
    SqlSource.TableName |
    SqlSource.Product |
    SqlSource.Join |
    SqlSource.Values |
    SqlSource.EmptyTable;

export namespace SqlSource {
    export interface TableName {
        readonly type: "TableName";
        readonly tableName: Types.TableName;
    }

    export interface Product {
        readonly type: "Product";
        readonly sqls: SQL[];
    }

    export interface Join {
        readonly type: "Join";
        readonly joinType: JoinType;
        readonly exp: Exp<SQL, boolean>;
        readonly left: SQL;
        readonly right: SQL;
    }

    export interface Values {
        readonly type: "Values";
        readonly cols: SomeCol<SQL>[];
        readonly params: SomeCol<SQL>[][];
    }

    export interface EmptyTable {
        readonly type: "EmptyTable";
    }
}

export const enum JoinType {
    InnerJoin,
    LeftJoin
}

export interface SQL {
    readonly cols: SomeCol<SQL>[];
    readonly source: SqlSource;
    readonly restricts: Exp<SQL, boolean>[];
    readonly groups: SomeCol<SQL>[];
    readonly ordering: [Order, SomeCol<SQL>][];
    readonly limits: [number, number] | null;
    readonly distinct: boolean;
}

/**
 * Build a plain SQL query with the given columns and source, with no filters, ordering, etc.
 */
export function sqlFrom(cs: SomeCol<SQL>[], src: SqlSource): SQL {
    return {
        cols: cs,
        source: src,
        restricts: [],
        groups: [],
        ordering: [],
        limits: null,
        distinct: false
    };
}

export const enum Order {
    /**
     * Equivalent to [[AscNullsLast]]
     */
    Asc,

    /**
     * Equivalent to [[DescNullsFirst]]
     */
    Desc,

    AscNullsLast,

    DescNullsFirst,

    AscNullsFirst,

    DescNullsLast
}

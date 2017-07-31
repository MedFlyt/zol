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
        readonly params: Param[][];
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
}

export const enum Order {
    Asc,
    Desc
}

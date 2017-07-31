import * as SqlType from "./SqlType";
import { ColName } from "./Types";

export type SomeCol<sql> = SomeCol.Some<sql> | SomeCol.Named<sql>;

export namespace SomeCol {
    export interface Some<sql> {
        readonly type: "Some";
        readonly exp: Exp<sql, any>;
        readonly parser: (val: string) => any;
    }

    export interface Named<sql> {
        readonly type: "Named";
        readonly colName: ColName;
        readonly exp: Exp<sql, any>;
        readonly parser: (val: string) => any;
    }
}

export type Exp<sql, a> =
    Exp.ECol |
    Exp.ETblCol |
    Exp.ELit |
    Exp.EBinOp<sql, a> |
    Exp.ECustomBinOp<sql, a> |
    Exp.EUnOp<sql, a> |
    Exp.EFun2<sql, a> |
    Exp.ECast<sql, a> |
    Exp.EAggrEx<sql, a> |
    Exp.EInList<sql, a> |
    Exp.EInQuery<sql, a>;

export namespace Exp {
    export interface ECol {
        readonly type: "ECol";
        readonly colName: ColName;
        readonly parser: (val: string) => any;
    }

    export interface ETblCol {
        readonly type: "ETblCol";
        readonly colNames: ColName[];
    }

    export interface ELit {
        readonly type: "ELit";
        readonly lit: SqlType.Lit;
    }

    export interface EBinOp<sql, a> {
        readonly type: "EBinOp";
        readonly op: BinOp;
        readonly lhs: Exp<sql, a>;
        readonly rhs: Exp<sql, a>;
        readonly parser: (val: string) => any;
    }

    export interface ECustomBinOp<sql, a> {
        readonly type: "ECustomBinOp";
        readonly op: string;
        readonly lhs: Exp<sql, a>;
        readonly rhs: Exp<sql, a>;
    }

    export interface EUnOp<sql, a> {
        readonly type: "EUnOp";
        readonly op: UnOp;
        readonly exp: Exp<sql, a>;
        readonly parser: (val: string) => any;
    }

    export interface EFun2<sql, a> {
        readonly type: "EFun2";
        readonly name: string;
        readonly lhs: Exp<sql, a>;
        readonly rhs: Exp<sql, a>;
    }

    export interface ECast<sql, a> {
        readonly type: "ECast";
        readonly exp: Exp<sql, a>;
        readonly sqlType: string;
        readonly parser: (val: string) => any;
    }

    export interface EAggrEx<sql, a> {
        readonly type: "EAggrEx";
        readonly name: string;
        readonly exp: Exp<sql, a>;
        readonly parser: (val: string) => any;
    }

    export interface EInList<sql, a> {
        readonly type: "EInList";
        readonly exp: Exp<sql, a>;
        readonly exps: Exp<sql, a>[];
    }

    export interface EInQuery<sql, a> {
        readonly type: "EInQuery";
        readonly exp: Exp<sql, a>;
        readonly sql: sql;
    }
}

export type UnOp =
    UnOp.UAbs |
    UnOp.UNot |
    UnOp.UNeg |
    UnOp.USgn |
    UnOp.UIsNull |
    UnOp.UFun;

export namespace UnOp {
    export interface UAbs {
        type: "UAbs";
    }

    export interface UNot {
        type: "UNot";
    }

    export interface UNeg {
        type: "UNeg";
    }

    export interface USgn {
        type: "USgn";
    }

    export interface UIsNull {
        type: "UIsNull";
    }

    export interface UFun {
        type: "UFun";
        name: string;
    }
}

export const enum BinOp {
    Gt,
    Lt,
    Gte,
    Lte,
    Eq,
    Neq,
    And,
    Or,
    Add,
    Sub,
    Mul,
    Div,
    Concat,
    Like
}

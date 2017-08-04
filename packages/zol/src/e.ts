import { Col, colUnwrap, colWrap } from "./Column";
import { BinOp } from "./Exp";
import { SqlType } from "./SqlType";

export function e<s, a>(lhs: Col<s, a>, op: "=", rhs: Col<s, a>): Col<s, boolean>;
export function e<s, a>(lhs: Col<s, a>, op: "!=", rhs: Col<s, a>): Col<s, boolean>;
export function e<s, a>(lhs: Col<s, a>, op: ">", rhs: Col<s, a>): Col<s, boolean>;
export function e<s, a>(lhs: Col<s, a>, op: "<", rhs: Col<s, a>): Col<s, boolean>;
export function e<s, a>(lhs: Col<s, a>, op: ">=", rhs: Col<s, a>): Col<s, boolean>;
export function e<s, a>(lhs: Col<s, a>, op: "<=", rhs: Col<s, a>): Col<s, boolean>;
export function e<s>(lhs: Col<s, boolean>, op: "AND", rhs: Col<s, boolean>): Col<s, boolean>;
export function e<s>(lhs: Col<s, boolean>, op: "OR", rhs: Col<s, boolean>): Col<s, boolean>;
export function e<s>(lhs: Col<s, number>, op: "+", rhs: Col<s, number>): Col<s, number>;
export function e<s>(lhs: Col<s, number>, op: "-", rhs: Col<s, number>): Col<s, number>;
export function e<s>(lhs: Col<s, number>, op: "*", rhs: Col<s, number>): Col<s, number>;
export function e<s>(lhs: Col<s, number>, op: "/", rhs: Col<s, number>): Col<s, number>;
export function e<s>(lhs: Col<s, string>, op: "||", rhs: Col<s, string>): Col<s, string>;

export function e(lhs: any, op: string, rhs: any): any {
    switch (op) {
        case "=":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Eq,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.booleanParser
            });
        case "!=":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Neq,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.booleanParser
            });
        case ">":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Gt,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.booleanParser
            });
        case "<":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Lt,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.booleanParser
            });
        case ">=":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Gte,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.booleanParser
            });
        case "<=":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Lte,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.booleanParser
            });
        case "AND":
            return colWrap({
                type: "EBinOp",
                op: BinOp.And,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.booleanParser
            });
        case "OR":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Or,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.booleanParser
            });
        case "+":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Add,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.numberParser
            });
        case "-":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Sub,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.numberParser
            });
        case "*":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Mul,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.numberParser
            });
        case "/":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Div,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.numberParser
            });
        case "||":
            return colWrap({
                type: "EBinOp",
                op: BinOp.Concat,
                lhs: colUnwrap(lhs),
                rhs: colUnwrap(rhs),
                parser: SqlType.stringParser
            });
        /* istanbul ignore next  */
        default:
            throw new Error(`The Impossible Happened. Unexpected op: "${op}"`);
    }
}

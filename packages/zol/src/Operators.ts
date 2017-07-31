import { Col, colUnwrap, colWrap, textCol } from "./Column";
import { BinOp } from "./Exp";
import { Q, restrict } from "./Imperative";
import { SqlType } from "./SqlType";

/**
 * Is the given column null?
 *
 * This is like SQL's `IS NULL` check
 */
export function isNull<s, a>(col: Col<s, a | null>): Col<s, boolean> {
    return <any>colWrap({
        type: "EUnOp",
        op: {
            type: "UIsNull"
        },
        exp: colUnwrap(col),
        parser: SqlType.booleanParser
    });
}

/**
 * Is the given column not null?
 *
 * This is like SQL's `IS NOT NULL` check
 *
 * `isNotNull(c)` is equivalent to `not(isNull(c))`
 */
export function isNotNull<s, a>(col: Col<s, a | null>): Col<s, boolean> {
    return not(isNull(col));
}

/**
 * Boolean negation.
 *
 * This is like SQL's `NOT` operator
 */
export function not<s, a>(col: Col<s, a | null>): Col<s, boolean> {
    return <any>colWrap({
        type: "EUnOp",
        op: {
            type: "UNot"
        },
        exp: colUnwrap(col),
        parser: SqlType.booleanParser
    });
}

/**
 * A shortcut that calls `restrict` comparing two columns for equality.
 *
 * `restrictEq(q, x, y)` is equivalent to `restrict(q, e(x, "=", y))`
 */
export function restrictEq<s, a>(q: Q<s>, lhs: Col<s, a>, rhs: Col<s, a>) {
    const expr = colWrap<s, boolean>({
        type: "EBinOp",
        op: BinOp.Eq,
        lhs: colUnwrap(lhs),
        rhs: colUnwrap(rhs),
        parser: SqlType.booleanParser // TODO I don't think we actually need this
    });

    restrict(q, expr);
}

/**
 * Returns true if the string matches the supplied pattern
 *
 * SQL equivalent: `LIKE`
 *
 * @param str The string to be matched against
 * @param pattern The pattern to use. May use special characters '%' and '_'
 */
export function like<s>(str: Col<s, string>, pattern: string): Col<s, boolean>;

/**
 * Returns true if the string matches the supplied pattern
 *
 * SQL equivalent: `LIKE`
 *
 * @param str The string to be matched against
 * @param pattern The pattern to use. May use special characters '%' and '_'
 */
export function like<s>(str: Col<s, string>, pattern: Col<s, string>): Col<s, boolean>;

export function like<s>(str: Col<s, string>, pattern: string | Col<s, string>): Col<s, boolean> {
    if (typeof pattern === "string") {
        return <any>colWrap({
            type: "EBinOp",
            op: BinOp.Like,
            lhs: colUnwrap(str),
            rhs: colUnwrap(textCol(pattern)),
            parser: SqlType.booleanParser
        });
    } else {
        return <any>colWrap({
            type: "EBinOp",
            op: BinOp.Like,
            lhs: colUnwrap(str),
            rhs: colUnwrap(pattern),
            parser: SqlType.booleanParser
        });
    }
}

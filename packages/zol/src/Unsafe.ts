import { Col, colUnwrap, colWrap } from "./Column";
import { Aggr } from "./Query";

/**
 * Perform a runtime cast of a column to a specified SQL type
 *
 * @param sqlType The SQL type, such as `BIGINT`
 */
export function unsafeCast<s, a, b>(col: Col<s, a>, sqlType: string, parser: (val: string) => b): Col<s, b> {
    return <any>colWrap({
        type: "ECast",
        exp: colUnwrap(col),
        sqlType: sqlType,
        parser: parser
    });
}

/**
 * A unary operation. Note that the provided function name is spliced directly
 * into the resulting SQL query. Thus, this function should ONLY be used to
 * implement well-defined functions that are missing from Zol's standard library,
 * and NOT in an ad hoc manner during queries.
 *
 * @param funName Name of the SQL function
 * @param col Argument to the function
 * @param parser Function that parses the raw SQL value into the return type of the function
 */
export function unsafeFun<s, a, b>(funName: string, col: Col<s, a>, parser: (val: string) => b): Col<s, b> {
    return <any>colWrap({
        type: "EUnOp",
        op: {
            type: "UFun",
            name: funName
        },
        exp: colUnwrap(col),
        parser: parser
    });
}

/**
 * Like [[unsafeFun]], but with two arguments.
 *
 * @param funName Name of the SQL function
 * @param col1 First argument to the function
 * @param col2 Second argument to the function
 * @param parser Function that parses the raw SQL value into the return type of the function
 */
export function unsafeFun2<s, a, b, c>(funName: string, col1: Col<s, a>, col2: Col<s, b>): Col<s, c> {
    return <any>colWrap({
        type: "EFun2",
        name: funName,
        lhs: colUnwrap(col1),
        rhs: colUnwrap(col2)
    });
}

/**
 * Create a named aggregate function. Like [[fun]], this function is generally
 * unsafe and should ONLY be used to implement missing backend-specific
 * functionality.
 *
 * @param funName Name of the SQL function
 * @param col Argument to the function
 * @param parser Function that parses the raw SQL value into the return type of the function
 */
export function unsafeAggr<s, a, b>(funName: string, col: Col<s, a>, parser: (val: string) => b): Aggr<s, b> {
    return <any>colWrap({
        type: "EAggrEx",
        name: funName,
        exp: colUnwrap(col),
        parser: parser
    });
}

export function unsafeBinOp<s, a, b, c>(opName: string, lhs: Col<s, a>, rhs: Col<s, b>, parser: (val: string) => c): Col<s, c> {
    return <any>colWrap({
        type: "ECustomBinOp",
        op: opName,
        lhs: colUnwrap(lhs),
        rhs: colUnwrap(rhs),
        parser: parser
    });
}

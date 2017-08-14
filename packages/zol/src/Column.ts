import { Exp } from "./Exp";
import { isNull } from "./Operators";
import { SQL } from "./SQL";
import { SqlType } from "./SqlType";

/**
 * A database column. A column is often a literal column table, but can also
 * be an expression over such a column or a constant expression.
 *
 * @param s Phantom type parameter. This will never have a concrete type. It
 *          is used only to enforce type safety
 *
 * @param a The type of the value that the Column contains
 */
export class Col<s, a> {
    protected dummy: [Col<s, a>, s, a];
}

export function colWrap<s, a>(val: Exp<SQL, a>): Col<s, a> {
    return <any>val;
}

export function colUnwrap<s, a>(val: Col<s, a>): Exp<SQL, a> {
    return <any>val;
}

export type ManyCols<s> = object;

export type Cols<s, a> = Col<s, a> | ManyCols<s>;

export function liftC2<s, a, b, c>(f: (x: Exp<SQL, a>, y: Exp<SQL, b>) => Exp<SQL, c>): ((x: Col<s, a>, y: Col<s, b>) => Col<s, c>) {
    return (x: Col<s, a>, y: Col<s, b>): Col<s, c> => {
        return colWrap(f(colUnwrap(x), colUnwrap(y)));
    };
}

export function nullCol<s>(): Col<s, null> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LNull"
        },
        parser: val => val
    });
}

export function booleanCol<s>(val: boolean): Col<s, boolean> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LText",
            value: val ? "t" : "f"
        },
        parser: SqlType.booleanParser
    });
}

export function textCol<s>(str: string): Col<s, string> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LText",
            value: str
        },
        parser: SqlType.stringParser
    });
}

export function numberCol<s>(val: number): Col<s, number> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LInt",
            value: val
        },
        parser: SqlType.numberParser
    });
}

/**
 * Perform a conditional on a column
 *
 * SQL equivalent: `CASE`
 */
export function ifThenElse<s, a>(if_: Col<s, boolean>, then: Col<s, a>, else_: Col<s, a>): Col<s, a> {
    return colWrap({
        type: "EIfThenElse",
        expIf: <any>colUnwrap(if_),
        expThen: colUnwrap(then),
        expElse: colUnwrap(else_),

        // the "then" and "else_" columns are of the same type, so they
        // (supposedly) have the same parser, so we can arbitrarily pick
        // either one:
        parser: (<any>colUnwrap(then)).parser
    });
}

/**
 * If the nullable column Column `nullable` is NULL then return the
 * replacement column, otherwise map the underlying column using the
 * provided function.
 *
 * @param nullable A nullable column to match against
 * @param replacement This is the value that will be returned if the nullable column is NULL
 * @param f This function will be called if the nullable column is not null, and its result will be returned
 */
export function matchNullable<s, a, b>(nullable: Col<s, a | null>, replacement: Col<s, b>, f: <s2>(col: Col<s2, a>) => Col<s2, b>): Col<s, b> {
    return ifThenElse(isNull(nullable), replacement, f(<any>nullable));
}

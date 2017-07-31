import { Exp } from "./Exp";
import { SQL } from "./SQL";

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
    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): [Col<s, a>, s, a] { throw new Error(); }
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

export function nullCol<s>(): Col<s, null> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LNull"
        }
    });
}

export function booleanCol<s>(val: boolean): Col<s, boolean> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LBool",
            value: val
        }
    });
}

export function textCol<s>(str: string): Col<s, string> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LText",
            value: str
        }
    });
}

export function numberCol<s>(val: number): Col<s, number> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LInt",
            value: val
        }
    });
}

export function dateCol<s>(val: Date): Col<s, Date> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LDateTime",
            value: val
        }
    });
}

/**
 * Calendar date (year, month, day)
 */
import { Col, colUnwrap, colWrap } from "./Column";

export class PGDate {
    public readonly year: number;
    public readonly month: number;
    public readonly day: number;

    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGDate { throw new Error(); }
}

/**
 * PostgreSQL `JSON` or `JSONB` type
 */
export class PGJson {
    public static parse(val: any): PGJson {
        if (typeof val === "object") {
            return <any>{
                data: val
            };
        } else {
            return <any>{
                data: JSON.parse(val)
            };
        }
    }

    /**
     * Get JSON array element (indexed from zero, negative integers count from the end)
     *
     * This is the PostgreSQL `->` operator
     */
    public static arrayElem<s>(lhs: Col<s, PGJson>, rhs: Col<s, number>): Col<s, PGJson | null> {
        return <any>colWrap({
            type: "ECustomBinOp",
            op: "->",
            lhs: colUnwrap(lhs),
            rhs: colUnwrap(rhs),
            parser: val => val
        });
    }

    /**
     * Get JSON object field by key
     *
     * This is the PostgreSQL `->` operator
     */
    public static objField<s>(lhs: Col<s, PGJson>, rhs: Col<s, string>): Col<s, PGJson | null> {
        return <any>colWrap({
            type: "ECustomBinOp",
            op: "->",
            lhs: colUnwrap(lhs),
            rhs: colUnwrap(rhs),
            parser: val => val
        });
    }

    /**
     * Get JSON array element as text (indexed from zero, negative integers count from the end)
     *
     * This is the PostgreSQL `->>` operator
     */
    public static arrayElemAsText<s>(lhs: Col<s, PGJson>, rhs: Col<s, number>): Col<s, string | null> {
        return <any>colWrap({
            type: "ECustomBinOp",
            op: "->>",
            lhs: colUnwrap(lhs),
            rhs: colUnwrap(rhs),
            parser: val => val
        });
    }

    /**
     * Get JSON object field as text
     *
     * This is the PostgreSQL `->>` operator
     */
    public static objFieldAsText<s>(lhs: Col<s, PGJson>, rhs: Col<s, string>): Col<s, string | null> {
        return <any>colWrap({
            type: "ECustomBinOp",
            op: "->>",
            lhs: colUnwrap(lhs),
            rhs: colUnwrap(rhs),
            parser: val => val
        });
    }

    public readonly data: {
        [key: string]: any
    };

    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGJson { throw new Error(); }
}

export function jsonCol<s>(json: object): Col<s, PGJson> {
    return colWrap({
        type: "ELit",
        lit: {
            type: "LText",
            value: JSON.stringify(json)
        }
    });
}

export class PGTime {
    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGTime { throw new Error(); }
}

export class PGTimeStamp {
    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGTimeStamp { throw new Error(); }
}

export class PGTimeStamptz {
    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGTimeStamptz { throw new Error(); }
}

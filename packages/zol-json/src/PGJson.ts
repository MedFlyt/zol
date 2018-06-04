import { Col, SqlType, textCol, Unsafe } from "zol";

/**
 * PostgreSQL `JSON` or `JSONB` type
 */
export class PGJson {
    public static parser(val: string): PGJson {
        return <any>{
            data: JSON.parse(val)
        };
    }

    public static col<s>(json: any): Col<s, PGJson> {
        return Unsafe.unsafeCast(textCol(JSON.stringify(json)), "JSONB", PGJson.parser);
    }

    /**
     * Get JSON array element (indexed from zero, negative integers count from the end)
     *
     * This is the PostgreSQL `->` operator
     */
    public static arrayElem<s>(lhs: Col<s, PGJson>, rhs: Col<s, number>): Col<s, PGJson | null> {
        return Unsafe.unsafeBinOp("->", lhs, Unsafe.unsafeCast(rhs, "INT", SqlType.intParser), PGJson.parser);
    }

    /**
     * Get JSON object field by key
     *
     * This is the PostgreSQL `->` operator
     */
    public static objField<s>(lhs: Col<s, PGJson>, rhs: Col<s, string>): Col<s, PGJson | null> {
        return Unsafe.unsafeBinOp("->", lhs, rhs, PGJson.parser);
    }

    /**
     * Get JSON array element as text (indexed from zero, negative integers count from the end)
     *
     * This is the PostgreSQL `->>` operator
     */
    public static arrayElemAsText<s>(lhs: Col<s, PGJson>, rhs: Col<s, number>): Col<s, string | null> {
        return Unsafe.unsafeBinOp("->>", lhs, Unsafe.unsafeCast(rhs, "INT", SqlType.intParser), SqlType.stringParser);
    }

    /**
     * Get JSON object field as text
     *
     * This is the PostgreSQL `->>` operator
     */
    public static objFieldAsText<s>(lhs: Col<s, PGJson>, rhs: Col<s, string>): Col<s, string | null> {
        return Unsafe.unsafeBinOp("->>", lhs, rhs, SqlType.stringParser);
    }

    public static buildObject<s>(values: PGJson.Build<s>[]): Col<s, PGJson> {
        const args: Col<s, any>[] = [];
        for (const v of values) {
            args.push(v.key);
            args.push(v.value);
        }
        return Unsafe.unsafeFunN("jsonb_build_object", args, PGJson.parser);
    }

    /**
     * check if JSON array contains text
     *
     * This is the PostgreSQL `?` operator
     */
    public static arrayContainsText<s>(lhs: Col<s, PGJson>, rhs: Col<s, string>): Col<s, boolean | null> {
        return Unsafe.unsafeBinOp("?", lhs, Unsafe.unsafeCast(rhs, "TEXT", SqlType.textParser), PGJson.parser);
    }

    /**
     * The actual JSON object
     */
    public readonly data: any;

    protected dummy: PGJson;
}

export namespace PGJson {
    export interface Build<s> {
        key: Col<s, string>;
        value: Col<s, any>;
    }
}

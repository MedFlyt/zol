import { Col, SqlType, textCol, unsafeBinOp } from "zol";

/**
 * PostgreSQL `JSON` or `JSONB` type
 */
export class PGJson {
    public static parser(val: string): PGJson {
        return <any>{
            data: JSON.parse(val)
        };
    }

    public static col<s>(json: object): Col<s, PGJson> {
        return <any>textCol(JSON.stringify(json));
    }

    /**
     * Get JSON array element (indexed from zero, negative integers count from the end)
     *
     * This is the PostgreSQL `->` operator
     */
    public static arrayElem<s>(lhs: Col<s, PGJson>, rhs: Col<s, number>): Col<s, PGJson | null> {
        return unsafeBinOp("->", lhs, rhs, PGJson.parser);
    }

    /**
     * Get JSON object field by key
     *
     * This is the PostgreSQL `->` operator
     */
    public static objField<s>(lhs: Col<s, PGJson>, rhs: Col<s, string>): Col<s, PGJson | null> {
        return unsafeBinOp("->", lhs, rhs, PGJson.parser);
    }

    /**
     * Get JSON array element as text (indexed from zero, negative integers count from the end)
     *
     * This is the PostgreSQL `->>` operator
     */
    public static arrayElemAsText<s>(lhs: Col<s, PGJson>, rhs: Col<s, number>): Col<s, string | null> {
        return unsafeBinOp("->>", lhs, rhs, SqlType.stringParser);
    }

    /**
     * Get JSON object field as text
     *
     * This is the PostgreSQL `->>` operator
     */
    public static objFieldAsText<s>(lhs: Col<s, PGJson>, rhs: Col<s, string>): Col<s, string | null> {
        return unsafeBinOp("->>", lhs, rhs, SqlType.stringParser);
    }

    /**
     * The actual JSON object
     */
    public readonly data: {
        [key: string]: any
    };

    protected dummy: PGJson;
}

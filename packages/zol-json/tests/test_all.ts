import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { Col, numberCol, query, SqlType, textCol, Unsafe } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { PGJson } from "../src/zol-json";

function intCol<s>(val: number): Col<s, number> {
    return Unsafe.unsafeCast(numberCol(val), "INT", SqlType.numberParser);
}

test("json obj field", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: PGJson.objFieldAsText(Unsafe.unsafeCast(PGJson.col({ a: 1, b: 2 }), "JSONB", PGJson.parser), textCol("a"))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: "1"
        }
    ];

    t.deepEqual(r1, expected_r1);
}));

test("jsobBuild", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: PGJson.buildObject([
                {
                    key: textCol("foo"),
                    value: intCol(3)
                },
                {
                    key: textCol("bar"),
                    value: textCol("bar")
                },
                {
                    key: textCol("blah"),
                    value: PGJson.buildObject([
                        {
                            key: textCol("baz"),
                            value: textCol("quz")
                        }
                    ])
                }
            ])
        };
    });

    const actual = r1[0].val.data;

    const expected: typeof actual = {
        foo: 3,
        bar: "bar",
        blah: {
            baz: "quz"
        }
    };

    t.deepEqual(actual, expected);
}));

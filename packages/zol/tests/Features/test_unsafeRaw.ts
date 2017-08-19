import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { Col, query, SqlType, textCol, unsafeBinOp, unsafeCast, unsafeRaw } from "../../src/zol";

type JSON = string;

function jsonCol<s>(val: any): Col<s, JSON> {
    return unsafeCast(textCol(JSON.stringify(val)), "JSONB", v => v);
}

function jsonToTextArray<s>(json: Col<s, JSON>): Col<s, string> {
    return unsafeRaw(["ARRAY(SELECT jsonb_array_elements_text(", json, "))"], val => val);
}

function arraysOverlap<s>(a: Col<s, string>, b: Col<s, string>): Col<s, boolean> {
    return unsafeBinOp("&&", a, b, SqlType.booleanParser);
}

test("unsafeRaw 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        return {
            val: arraysOverlap(jsonToTextArray(jsonCol(["foo", "bar"])), jsonToTextArray(jsonCol(["blah", "baz"])))
        };
    });

    const expected: typeof actual = [{ val: false }];

    t.deepEqual(actual, expected);
}));

test("unsafeRaw 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        return {
            val: arraysOverlap(jsonToTextArray(jsonCol(["foo", "bar"])), jsonToTextArray(jsonCol(["blah", "foo"])))
        };
    });

    const expected: typeof actual = [{ val: true }];

    t.deepEqual(actual, expected);
}));

test("unsafeRaw 3", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        return {
            val: arraysOverlap(jsonToTextArray(jsonCol(["foo", "bar"])), jsonToTextArray(jsonCol(["bar"])))
        };
    });

    const expected: typeof actual = [{ val: true }];

    t.deepEqual(actual, expected);
}));

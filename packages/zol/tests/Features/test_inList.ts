import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { Col, inList, numberCol, query, restrict, SqlType, textCol, Unsafe } from "../../src/zol";

test("in list", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => {
        return {
            val: inList(textCol("a"), [textCol("a"), textCol("b"), textCol("c")])
        };
    });

    const expected_r1: typeof r1 = [{ val: true }];

    const r2 = await query("", conn, _q => {
        return {
            val: inList(textCol("a"), [textCol("b"), textCol("c")])
        };
    });

    const expected_r2: typeof r2 = [{ val: false }];

    const r3 = await query("", conn, _q => {
        return {
            val: inList(textCol("c"), [textCol("a"), textCol("b"), textCol("c")])
        };
    });

    const expected_r3: typeof r3 = [{ val: true }];

    t.deepEqual([r1, r2, r3], [expected_r1, expected_r2, expected_r3]);
}));

function intCol<s>(val: number): Col<s, number> {
    return Unsafe.unsafeCast(numberCol(val), "INT", SqlType.numberParser);
}

test("in list empty", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, q => {
        restrict(q, inList(textCol("a"), []));
        return {
            val: intCol(2)
        };
    });

    const expected_r1: typeof r1 = [];

    t.deepEqual(r1, expected_r1);
}));

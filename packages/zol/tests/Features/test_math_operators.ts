import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/test_db";
import { Col, e, numberCol, query, SqlType, unsafeCast } from "../../src/zol";

function intCol<s>(val: number): Col<s, number> {
    return unsafeCast(numberCol(val), "INT", SqlType.numberParser);
}

test("math add", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(intCol(8), "+", intCol(4))
        };
    });

    const expected_r1: typeof r1 = [{ val: 12 }];

    t.deepEqual([r1], [expected_r1]);
}));

test("math sub", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(intCol(8), "-", intCol(4))
        };
    });

    const expected_r1: typeof r1 = [{ val: 4 }];

    t.deepEqual([r1], [expected_r1]);
}));

test("math mul", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(intCol(8), "*", intCol(4))
        };
    });

    const expected_r1: typeof r1 = [{ val: 32 }];

    t.deepEqual([r1], [expected_r1]);
}));

test("math divide", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(intCol(8), "/", intCol(4))
        };
    });

    const expected_r1: typeof r1 = [{ val: 2 }];

    t.deepEqual([r1], [expected_r1]);
}));

import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { isNotNull, isNull, nullCol, numberCol, query, SqlType, Unsafe } from "../../src/zol";

test("not expression", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: isNull(nullCol())
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: true
        }
    ];

    const r2 = await query(conn, _q => {
        return {
            val: isNull(Unsafe.unsafeCast(numberCol(4), "INT", SqlType.numberParser))
        };
    });

    const expected_r2: typeof r1 = [
        {
            val: false
        }
    ];

    const r3 = await query(conn, _q => {
        return {
            val: isNotNull(nullCol())
        };
    });

    const expected_r3: typeof r1 = [
        {
            val: false
        }
    ];

    t.deepEqual([r1, r2, r3], [expected_r1, expected_r2, expected_r3]);
}));

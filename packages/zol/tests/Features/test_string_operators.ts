import "../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../helper_framework/db";
import { e, like, query, textCol } from "../../src/zol";

test("string concat", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "||", textCol("b"))
        };
    });

    const expected_r1: typeof r1 = [{ val: "ab" }];

    t.deepEqual([r1], [expected_r1]);
}));

test("string like", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: like(textCol("abc"), textCol("abc"))
        };
    });

    const expected_r1: typeof r1 = [{ val: true }];

    const r2 = await query(conn, _q => {
        return {
            val: like(textCol("abc"), e(textCol("_"), "||", textCol("bc")))
        };
    });

    const expected_r2: typeof r2 = [{ val: true }];

    t.deepEqual([r1, r2], [expected_r1, expected_r2]);
}));

test("string like2", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: like(textCol("abc"), "_b_")
        };
    });

    const expected_r1: typeof r1 = [{ val: true }];

    const r2 = await query(conn, _q => {
        return {
            val: like(textCol("abc"), "b_")
        };
    });

    const expected_r2: typeof r2 = [{ val: false }];

    t.deepEqual([r1, r2], [expected_r1, expected_r2]);
}));

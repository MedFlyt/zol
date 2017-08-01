import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/test_db";
import { e, query, textCol } from "../../src/zol";

test("comparison equal", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "=", textCol("b"))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: false
        }
    ];

    const r2 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "=", textCol("a"))
        };
    });

    const expected_r2: typeof r1 = [
        {
            val: true
        }
    ];

    t.deepEqual([r1, r2], [expected_r1, expected_r2]);
}));

test("comparison not equal", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "!=", textCol("b"))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: true
        }
    ];

    const r2 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "!=", textCol("a"))
        };
    });

    const expected_r2: typeof r1 = [
        {
            val: false
        }
    ];

    t.deepEqual([r1, r2], [expected_r1, expected_r2]);
}));

test("comparison greater than", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(textCol("a"), ">", textCol("b"))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: false
        }
    ];

    const r2 = await query(conn, _q => {
        return {
            val: e(textCol("b"), ">", textCol("a"))
        };
    });

    const expected_r2: typeof r1 = [
        {
            val: true
        }
    ];

    const r3 = await query(conn, _q => {
        return {
            val: e(textCol("a"), ">", textCol("a"))
        };
    });

    const expected_r3: typeof r1 = [
        {
            val: false
        }
    ];

    t.deepEqual([r1, r2, r3], [expected_r1, expected_r2, expected_r3]);
}));

test("comparison less than", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "<", textCol("b"))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: true
        }
    ];

    const r2 = await query(conn, _q => {
        return {
            val: e(textCol("b"), "<", textCol("a"))
        };
    });

    const expected_r2: typeof r1 = [
        {
            val: false
        }
    ];

    const r3 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "<", textCol("a"))
        };
    });

    const expected_r3: typeof r1 = [
        {
            val: false
        }
    ];

    t.deepEqual([r1, r2, r3], [expected_r1, expected_r2, expected_r3]);
}));

test("comparison greater than equal", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(textCol("a"), ">=", textCol("b"))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: false
        }
    ];

    const r2 = await query(conn, _q => {
        return {
            val: e(textCol("b"), ">=", textCol("a"))
        };
    });

    const expected_r2: typeof r1 = [
        {
            val: true
        }
    ];

    const r3 = await query(conn, _q => {
        return {
            val: e(textCol("a"), ">=", textCol("a"))
        };
    });

    const expected_r3: typeof r1 = [
        {
            val: true
        }
    ];

    t.deepEqual([r1, r2, r3], [expected_r1, expected_r2, expected_r3]);
}));

test("comparison less than equal", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "<=", textCol("b"))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: true
        }
    ];

    const r2 = await query(conn, _q => {
        return {
            val: e(textCol("b"), "<=", textCol("a"))
        };
    });

    const expected_r2: typeof r1 = [
        {
            val: false
        }
    ];

    const r3 = await query(conn, _q => {
        return {
            val: e(textCol("a"), "<=", textCol("a"))
        };
    });

    const expected_r3: typeof r1 = [
        {
            val: true
        }
    ];

    t.deepEqual([r1, r2, r3], [expected_r1, expected_r2, expected_r3]);
}));

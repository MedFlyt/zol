import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { booleanCol } from "../../src/Column";
import { e, not, query } from "../../src/zol";

test("not expression", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: not(booleanCol(true))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: false
        }
    ];

    const r2 = await query(conn, _q => {
        return {
            val: not(booleanCol(false))
        };
    });

    const expected_r2: typeof r1 = [
        {
            val: true
        }
    ];

    t.deepEqual([r1, r2], [expected_r1, expected_r2]);
}));

test("boolean and", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(booleanCol(true), "AND", booleanCol(true))
        };
    });

    const expected_r1: typeof r1 = [{ val: true }];

    const r2 = await query(conn, _q => {
        return {
            val: e(booleanCol(true), "AND", booleanCol(false))
        };
    });

    const expected_r2: typeof r2 = [{ val: false }];

    const r3 = await query(conn, _q => {
        return {
            val: e(booleanCol(false), "AND", booleanCol(true))
        };
    });

    const expected_r3: typeof r3 = [{ val: false }];

    const r4 = await query(conn, _q => {
        return {
            val: e(booleanCol(false), "AND", booleanCol(false))
        };
    });

    const expected_r4: typeof r4 = [{ val: false }];

    t.deepEqual([r1, r2, r3, r4], [expected_r1, expected_r2, expected_r3, expected_r4]);
}));

test("boolean or", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: e(booleanCol(true), "OR", booleanCol(true))
        };
    });

    const expected_r1: typeof r1 = [{ val: true }];

    const r2 = await query(conn, _q => {
        return {
            val: e(booleanCol(true), "OR", booleanCol(false))
        };
    });

    const expected_r2: typeof r2 = [{ val: true }];

    const r3 = await query(conn, _q => {
        return {
            val: e(booleanCol(false), "OR", booleanCol(true))
        };
    });

    const expected_r3: typeof r3 = [{ val: true }];

    const r4 = await query(conn, _q => {
        return {
            val: e(booleanCol(false), "OR", booleanCol(false))
        };
    });

    const expected_r4: typeof r4 = [{ val: false }];

    t.deepEqual([r1, r2, r3, r4], [expected_r1, expected_r2, expected_r3, expected_r4]);
}));

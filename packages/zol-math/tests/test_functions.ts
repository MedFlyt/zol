import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { numberCol, query } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { sqrt } from "../src/zol-math";

test("sqrt", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => {
        return {
            val: sqrt(numberCol(9))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: 3
        }
    ];

    t.deepEqual(r1, expected_r1);
}));

test("sqrt 2", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => {
        return {
            val: sqrt(numberCol(4.84))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: 2.2
        }
    ];

    t.deepEqual(r1, expected_r1);
}));

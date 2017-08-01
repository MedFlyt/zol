import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { query, textCol, unsafeCast } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { PGJson } from "../src/zol-json";

test("json obj field", t => withTestDatabase(async conn => {
    const r1 = await query(conn, _q => {
        return {
            val: PGJson.objFieldAsText(unsafeCast(PGJson.col({ a: 1, b: 2 }), "JSONB", PGJson.parser), textCol("a"))
        };
    });

    const expected_r1: typeof r1 = [
        {
            val: "1"
        }
    ];

    t.deepEqual(r1, expected_r1);
}));

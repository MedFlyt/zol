import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { LocalDate } from "js-joda/dist/js-joda";
import { query } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { localDateCol } from "../src/zol-time";

test("local date simple", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateCol(LocalDate.of(2017, 8, 12))
    }));

    t.equal(actual[0].val.toString(), "2017-08-12");
}));

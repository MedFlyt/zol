import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/test_db";
import { Col, Q, query, SqlType, textCol, unsafeCast } from "../../src/zol";

test("cast", t => withTestDatabase(async conn => {
    const selectString = <s>(_q: Q<s>) => {
        return {
            val: textCol("5")
        };
    };
    const actual = await query(conn, q => {
        const str = selectString(q);
        const numCol: Col<{}, number> = unsafeCast(str.val, "INT", SqlType.numberParser);
        return {
            val: numCol
        };
    });

    const expected: typeof actual = [
        {
            val: 5
        }
    ];

    t.deepEqual(actual, expected);
}));

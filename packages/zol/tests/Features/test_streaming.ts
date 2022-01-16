import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { Col, numberCol, order, Order, queryStreaming, selectValues, SqlType, textCol, Unsafe } from "../../src/zol";

test("streaming nums", t => withTestDatabase(async conn => {
    if ((conn as any).native !== undefined) {
        return t.skip("Streaming not supported when using \"pg-native\" driver");
    }

    const numTotalRows = 55;
    const rowChunkSize = 10;

    const vals: { num: Col<{}, number> }[] = [];
    for (let i = 1; i <= numTotalRows; ++i) {
        vals.push({ num: Unsafe.unsafeCast(numberCol(i), "INT", SqlType.intParser) });
    }

    const resultsStream = await queryStreaming("", conn, q => {
        const num = selectValues(q, vals);
        order(q, num.num, Order.Asc);
        return {
            num: num.num,
            name: textCol("foo")
        };
    }, rowChunkSize);

    let numRowChunks = 0;

    let collectedRows: {
        num: number;
        name: string;
    }[] = [];

    await resultsStream.readAllRows(async rows => {
        numRowChunks++;
        t.notEqual(rows.length, 0);
        collectedRows = collectedRows.concat(rows);
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 10);
        });
    });

    t.equal(numRowChunks, Math.ceil(numTotalRows / rowChunkSize));

    const expected: typeof collectedRows = [];
    for (let i = 1; i <= numTotalRows; ++i) {
        expected.push({
            name: "foo",
            num: i
        });
    }

    t.deepEqual(collectedRows, expected);
}));

test("streaming empty", t => withTestDatabase(async conn => {
    if ((conn as any).native !== undefined) {
        return t.skip("Streaming not supported when using \"pg-native\" driver");
    }

    const resultsStream = await queryStreaming("", conn, q => {
        return selectValues(q, []);
    });

    await resultsStream.readAllRows(async rows => {
        /* istanbul ignore next */
        t.fail(`Unexpected rows: ${JSON.stringify(rows)}`);
    });

    t.pass();
}));

test("streaming action error 1", t => withTestDatabase(async conn => {
    if ((conn as any).native !== undefined) {
        return t.skip("Streaming not supported when using \"pg-native\" driver");
    }

    const numTotalRows = 40;
    const rowChunkSize = 10;

    const vals: { num: Col<{}, number> }[] = [];
    for (let i = 1; i <= numTotalRows; ++i) {
        vals.push({ num: Unsafe.unsafeCast(numberCol(i), "INT", SqlType.intParser) });
    }

    const resultsStream = await queryStreaming("", conn, q => {
        const num = selectValues(q, vals);
        order(q, num.num, Order.Asc);
        return {
            num: num.num,
            name: textCol("foo")
        };
    }, rowChunkSize);

    let numRowChunks = 0;

    try {
        await resultsStream.readAllRows(async _rows => {
            /* istanbul ignore else  */
            if (numRowChunks === 0) {
                throw new Error("Some Error");
            }
            /* istanbul ignore next */
            numRowChunks++;
        });
    } catch (e) {
        t.deepEqual(e.message, "Some Error");
        return;
    }

    /* istanbul ignore next */
    t.fail("Expected error was not thrown");
}));

test("streaming action error 2", t => withTestDatabase(async conn => {
    if ((conn as any).native !== undefined) {
        return t.skip("Streaming not supported when using \"pg-native\" driver");
    }

    const numTotalRows = 40;
    const rowChunkSize = 10;

    const vals: { num: Col<{}, number> }[] = [];
    for (let i = 1; i <= numTotalRows; ++i) {
        vals.push({ num: Unsafe.unsafeCast(numberCol(i), "INT", SqlType.intParser) });
    }

    const resultsStream = await queryStreaming("", conn, q => {
        const num = selectValues(q, vals);
        order(q, num.num, Order.Asc);
        return {
            num: num.num,
            name: textCol("foo")
        };
    }, rowChunkSize);

    let numRowChunks = 0;

    try {
        await resultsStream.readAllRows(async _rows => {
            if (numRowChunks === 1) {
                throw new Error("Some Error");
            }
            numRowChunks++;
        });
    } catch (e) {
        t.deepEqual(e.message, "Some Error");
        return;
    }

    /* istanbul ignore next */
    t.fail("Expected error was not thrown");
}));

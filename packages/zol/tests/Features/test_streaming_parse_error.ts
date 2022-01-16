import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { Col, ColumnParseError, declareTable, insertMany, MakeTable, numberCol, order, Order, pg, queryStreaming, select, SqlType, textCol } from "../../src/zol";

// --------------------------------------------------------------------

interface LetterPair {
    first: string;
    second: string;
}

// --------------------------------------------------------------------

const createLetterTableSql = `
    CREATE TABLE letter (
        num INT,
        pair TEXT NOT NULL
    );
`;

// --------------------------------------------------------------------

interface LetterReq {
    readonly num: number;
    readonly pair: LetterPair;
}

interface LetterDef {
}

// type LetterCols<s> = MakeCols<s, LetterReq & LetterDef>;
type LetterTable = MakeTable<LetterReq, LetterDef>;

const letterTable = declareTable<LetterReq, LetterDef>("letter", {
    num: ["num", SqlType.numberParser],
    pair: ["pair", letterPairParser]
});

function letterPairCol<s>(val: LetterPair): Col<s, LetterPair> {
    return <any>textCol(val.first + val.second);
}

function letterPairParser(val: string): LetterPair {
    if (val.length !== 2) {
        throw new Error(`Invalid LetterPair: ${val}`);
    }

    return {
        first: val.charAt(0),
        second: val.charAt(1)
    };
}

// --------------------------------------------------------------------

test("streaming parse error 1", t => withTestDatabase(async conn => {
    if ((conn as any).native !== undefined) {
        return t.skip("Streaming not supported when using \"pg-native\" driver");
    }

    await pg.query_(conn, createLetterTableSql);

    const vals: LetterTable[] = [
        {
            num: numberCol(1),
            pair: letterPairCol({
                first: "a",
                second: "b"
            })
        },
        {
            num: numberCol(2),
            pair: letterPairCol({
                first: "c",
                second: "d"
            })
        }
    ];

    await insertMany("", conn, letterTable, vals);
    await pg.query_(conn,
        `
        INSERT INTO letter
            ("num", "pair")
            VALUES
            (3, 'e')
        `);

    const stream = await queryStreaming("", conn, q => {
        const letter = select(q, letterTable);
        order(q, letter.num, Order.Asc);
        return {
            num: letter.num,
            pair: letter.pair
        };
    }, 2);

    let numRowChunks = 0;
    try {
        await stream.readAllRows(async rows => {
            /* istanbul ignore else  */
            if (numRowChunks === 0) {
                const expectedRows: typeof rows = [
                    { num: 1, pair: { first: "a", second: "b" } },
                    { num: 2, pair: { first: "c", second: "d" } }
                ];
                t.deepEqual(rows, expectedRows);
            } else {
                t.fail(`Unexpected rows: ${JSON.stringify(rows)}`);
            }
            numRowChunks++;
        });
    } catch (e) {
        /* istanbul ignore if  */
        if (!(e instanceof ColumnParseError)) {
            throw e;
        }

        t.deepEqual(
            {
                message: e.message,
                columnValue: e.columnValue,
                parseFunction: e.parseFunction
            },
            {
                message: "Invalid LetterPair: e",
                columnValue: "e",
                parseFunction: "letterPairParser"
            });
        return;
    }

    /* istanbul ignore next */
    t.fail("Expected error was not thrown");
}));

test("streaming parse error 2", t => withTestDatabase(async conn => {
    if ((conn as any).native !== undefined) {
        return t.skip("Streaming not supported when using \"pg-native\" driver");
    }

    await pg.query_(conn, createLetterTableSql);

    const vals: LetterTable[] = [
        {
            num: numberCol(1),
            pair: letterPairCol({
                first: "a",
                second: "b"
            })
        },
        {
            num: numberCol(2),
            pair: letterPairCol({
                first: "c",
                second: "d"
            })
        }
    ];

    await insertMany("", conn, letterTable, vals);
    await pg.query_(conn,
        `
        INSERT INTO letter
            ("num", "pair")
            VALUES
            (3, 'e')
        `);

    const stream = await queryStreaming("", conn, q => {
        const letter = select(q, letterTable);
        order(q, letter.num, Order.Desc);
        return {
            num: letter.num,
            pair: letter.pair
        };
    }, 2);

    try {
        await stream.readAllRows(async rows => {
            /* istanbul ignore next */
            t.fail(`Unexpected rows: ${JSON.stringify(rows)}`);
        });
    } catch (e) {
        /* istanbul ignore if  */
        if (!(e instanceof ColumnParseError)) {
            throw e;
        }

        t.deepEqual(
            {
                message: e.message,
                columnValue: e.columnValue,
                parseFunction: e.parseFunction
            },
            {
                message: "Invalid LetterPair: e",
                columnValue: "e",
                parseFunction: "letterPairParser"
            });
        return;
    }

    /* istanbul ignore next */
    t.fail("Expected error was not thrown");
}));

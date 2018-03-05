import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { Col, ColumnParseError, declareTable, insertMany, MakeTable, numberCol, order, Order, pg, query, select, SqlType, textCol } from "../../src/zol";

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


test("custom parser", t => withTestDatabase(async conn => {
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

    const actual = await query("", conn, q => {
        const letter = select(q, letterTable);
        order(q, letter.num, Order.Asc);
        return {
            num: letter.num,
            pair: letter.pair
        };
    });

    const expected: typeof actual = [
        {
            num: 1,
            pair: {
                first: "a",
                second: "b"
            }
        },
        {
            num: 2,
            pair: {
                first: "c",
                second: "d"
            }
        }
    ];

    t.deepEqual(actual, expected);
}));

test("custom parser error", t => withTestDatabase(async conn => {
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

    try {
        await query("", conn, q => {
            const letter = select(q, letterTable);
            order(q, letter.num, Order.Asc);
            return {
                num: letter.num,
                pair: letter.pair
            };
        });
    } catch (e) {
        if (!(e instanceof ColumnParseError)) {
            throw e;
        }

        t.deepEqual(
            {
                name: e.name,
                message: e.message,
                columnValue: e.columnValue,
                parseFunction: e.parseFunction
            },
            {
                name: "ColumnParseError",
                message: "Invalid LetterPair: e",
                columnValue: "e",
                parseFunction: "letterPairParser"
            });
        return;
    }

    t.fail("Expected error was not thrown");
}));

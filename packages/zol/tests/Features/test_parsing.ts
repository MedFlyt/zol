import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { Col, declareTable, insertMany, MakeTable, numberCol, Order, order, pg, query, select, SqlType, textCol } from "../../src/zol";

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

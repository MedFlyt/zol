import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { e, ifThenElse, insertMany, matchNull, nullCol, numberCol, Order, order, pg, query, select, textCol } from "../../src/zol";
import { bookTable, BookTable, createBookTableSql } from "./Tables";

test("matchNull", t => withTestDatabase(async conn => {
    await pg.query_(conn, createBookTableSql);

    const vals: BookTable[] = [
        {
            author: textCol("X"),
            numPages: numberCol(30),
            serial: numberCol(1),
            title: textCol("A book")
        },
        {
            author: textCol("X"),
            numPages: numberCol(5000),
            serial: numberCol(2),
            title: textCol("A long book")
        },
        {
            author: textCol("X"),
            numPages: nullCol(),
            serial: numberCol(3),
            title: textCol("Another book")
        }
    ];

    await insertMany(conn, bookTable, vals);

    const actual = await query(conn, q => {
        const book = select(q, bookTable);
        const pagesResult =
            matchNull(book.numPages, textCol("Unknown pages"), p => ifThenElse(e(p, "<", numberCol(100)), textCol("Short Book"), textCol("Long Book")));
        order(q, book.serial, Order.Asc);
        return {
            title: book.title,
            numPages: book.numPages,
            pagesResult: pagesResult
        };
    });

    const expected: typeof actual = [
        { title: "A book", numPages: 30, pagesResult: "Short Book" },
        { title: "A long book", numPages: 5000, pagesResult: "Long Book" },
        { title: "Another book", numPages: null, pagesResult: "Unknown pages" }
    ];

    t.deepEqual(actual, expected);
}));

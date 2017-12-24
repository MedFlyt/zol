import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { e, ifThenElse, insertMany, nullCol, numberCol, Order, order, pg, query, select, textCol } from "../../src/zol";
import { bookTable, BookTable, createBookTableSql } from "./Tables";

test("ifThenElse null parsing", t => withTestDatabase(async conn => {
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
        }
    ];

    await insertMany("", conn, bookTable, vals);

    const actual = await query("", conn, q => {
        const book = select(q, bookTable);
        const pagesResult = ifThenElse(e(book.numPages, ">", numberCol(100)), nullCol(), numberCol(1));
        order(q, book.serial, Order.Asc);
        return {
            title: book.title,
            numPages: book.numPages,
            pagesResult: pagesResult
        };
    });

    const expected: typeof actual = [
        { title: "A book", numPages: 30, pagesResult: 1 },
        { title: "A long book", numPages: 5000, pagesResult: null }
    ];

    t.deepEqual(actual, expected);
}));

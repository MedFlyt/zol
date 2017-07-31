import "../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../helper_framework/db";
import { defaultValue, e, insertMany, insertReturning, numberCol, Order, order, pg, query, select, textCol, update, updateReturning } from "../../src/zol";
import { bookDefaultAuthor, bookTable, BookTable, createBookTableSql, createPersonTableSql, personTable, PersonTable } from "./Tables";

test("update simple", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const vals: PersonTable = {
        id: defaultValue(),
        name: textCol("Alice"),
        age: numberCol(20)
    };

    const inserted = await insertReturning(conn, personTable, vals,
        row => ({
            id: row.id
        }));

    const numUpdated = await update(conn, personTable,
        row => e(row.id, "=", numberCol(inserted.id)),
        row => {
            const result: PersonTable = {
                ...row,
                age: e(row.age, "+", numberCol(1))
            };
            return result;
        }
    );

    t.deepEqual(numUpdated, 1);

    const r1 = await query(conn, q => {
        const person = select(q, personTable);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected_r1: typeof r1 = [
        {
            name: "Alice",
            age: 21
        }
    ];

    t.deepEqual([r1], [expected_r1]);
}));

test("update default", t => withTestDatabase(async conn => {
    await pg.query_(conn, createBookTableSql);

    const vals: BookTable[] = [
        {
            author: defaultValue(),
            numPages: defaultValue(),
            serial: numberCol(5),
            title: textCol("A book")
        },
        {
            author: textCol("X"),
            numPages: numberCol(100),
            serial: numberCol(6),
            title: textCol("Another book")
        }
    ];

    await insertMany(conn, bookTable, vals);

    await update(conn, bookTable,
        row => e(row.title, "=", textCol("Another book")),
        row => {
            const result: BookTable = {
                ...row,
                author: defaultValue(),
                title: e(row.title, "||", row.author)
            };
            return result;
        }
    );

    const actual = await query(conn, q => {
        const book = select(q, bookTable);
        order(q, book.serial, Order.Asc);
        return book;
    });

    const expected: typeof actual = [
        { author: bookDefaultAuthor, numPages: null, serial: 5, title: "A book" },
        { author: bookDefaultAuthor, numPages: 100, serial: 6, title: "Another bookX" }
    ];

    t.deepEqual(actual, expected);
}));

test("update returning", t => withTestDatabase(async conn => {
    await pg.query_(conn, createBookTableSql);

    const vals: BookTable[] = [
        {
            author: defaultValue(),
            numPages: defaultValue(),
            serial: numberCol(5),
            title: textCol("A book")
        },
        {
            author: textCol("X"),
            numPages: numberCol(100),
            serial: numberCol(6),
            title: textCol("Another book")
        }
    ];

    await insertMany(conn, bookTable, vals);

    const returned = await updateReturning(conn, bookTable,
        row => e(row.title, "=", textCol("Another book")),
        row => {
            const result: BookTable = {
                ...row,
                author: defaultValue(),
                title: e(row.title, "||", row.author)
            };
            return result;
        },
        row => ({ author: row.author })
    );

    const expected_returned: typeof returned = [
        { author: bookDefaultAuthor }
    ];

    t.deepEqual(returned, expected_returned);

    const actual = await query(conn, q => {
        const book = select(q, bookTable);
        order(q, book.serial, Order.Asc);
        return book;
    });

    const expected: typeof actual = [
        { author: bookDefaultAuthor, numPages: null, serial: 5, title: "A book" },
        { author: bookDefaultAuthor, numPages: 100, serial: 6, title: "Another bookX" }
    ];

    t.deepEqual(actual, expected);
}));

test("update empty", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const vals: PersonTable = {
        id: defaultValue(),
        name: textCol("Alice"),
        age: numberCol(20)
    };

    const inserted = await insertReturning(conn, personTable, vals,
        row => ({
            id: row.id
        }));

    const numUpdated = await update(conn, personTable,
        row => e(row.id, "=", numberCol(inserted.id)),
        row => {
            const result: PersonTable = {
                ...row
            };
            return result;
        }
    );

    t.deepEqual(numUpdated, 1);

    const r1 = await query(conn, q => {
        const person = select(q, personTable);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected_r1: typeof r1 = [
        {
            name: "Alice",
            age: 20
        }
    ];

    t.deepEqual([r1], [expected_r1]);
}));

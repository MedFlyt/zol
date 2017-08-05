import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { booleanCol, ConflictTarget, defaultValue, insert, insertMany, insertManyReturning, insertOnConflictDoNothing, insertOnConflictDoUpdate, insertReturning, nullCol, numberCol, Order, order, pg, query, select, textCol } from "../../src/zol";
import { bookDefaultAuthor, BookTable, bookTable, createBookTableSql, createPersonTableSql, personTable, PersonTable } from "./Tables";

test("insert select simple", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const vals: PersonTable = {
        id: defaultValue(),
        name: textCol("Alice"),
        age: numberCol(20)
    };

    await insertReturning(conn, personTable, vals,
        row => ({
            id: row.id
        }));

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

test.skip("insert returning empty", _t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const vals: PersonTable = {
        id: defaultValue(),
        name: textCol("Alice"),
        age: numberCol(20)
    };

    await insertReturning(conn, personTable, vals, () => ({}));
}));

test("insert book simple", t => withTestDatabase(async conn => {
    await pg.query_(conn, createBookTableSql);

    const vals: BookTable = {
        author: textCol("X"),
        numPages: nullCol(),
        serial: numberCol(5),
        title: textCol("A book")
    };

    await insert(conn, bookTable, vals);

    const actual = await query(conn, q => select(q, bookTable));

    const expected: typeof actual = [{
        author: "X",
        numPages: null,
        serial: 5,
        title: "A book"
    }];

    t.deepEqual(actual, expected);
}));

test("insert book default values", t => withTestDatabase(async conn => {
    await pg.query_(conn, createBookTableSql);

    const vals: BookTable = {
        author: defaultValue(),
        numPages: defaultValue(),
        serial: numberCol(5),
        title: textCol("A book")
    };

    await insert(conn, bookTable, vals);

    const actual = await query(conn, q => select(q, bookTable));

    const expected: typeof actual = [{
        author: bookDefaultAuthor,
        numPages: null,
        serial: 5,
        title: "A book"
    }];

    t.deepEqual(actual, expected);
}));

test("insert book default values returning", t => withTestDatabase(async conn => {
    await pg.query_(conn, createBookTableSql);

    const vals: BookTable = {
        author: defaultValue(),
        numPages: defaultValue(),
        serial: numberCol(5),
        title: textCol("A book")
    };

    const returned = await insertReturning(conn, bookTable, vals, row => ({ author: row.author, numPages: row.numPages }));

    const expected_returned: typeof returned = {
        author: bookDefaultAuthor,
        numPages: null
    };

    t.deepEqual(returned, expected_returned);

    const actual = await query(conn, q => select(q, bookTable));

    const expected: typeof actual = [{
        author: bookDefaultAuthor,
        numPages: null,
        serial: 5,
        title: "A book"
    }];

    t.deepEqual(actual, expected);
}));

test("insert many book default values returning", t => withTestDatabase(async conn => {
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

    const returned = await insertManyReturning(conn, bookTable, vals, row => ({ author: row.author, numPages: row.numPages }));

    const expected_returned: typeof returned = [
        {
            author: bookDefaultAuthor,
            numPages: null
        },
        {
            author: "X",
            numPages: 100
        }
    ];

    t.deepEqual(returned, expected_returned);

    const actual = await query(conn, q => select(q, bookTable));

    const expected: typeof actual = [
        {
            author: bookDefaultAuthor,
            numPages: null,
            serial: 5,
            title: "A book"
        },
        {
            author: "X",
            numPages: 100,
            serial: 6,
            title: "Another book"
        }
    ];

    t.deepEqual(actual, expected);
}));

test("insert on conflict", t => withTestDatabase(async conn => {
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

    {
        const rows = await query(conn, q => {
            const book = select(q, bookTable);
            order(q, book.serial, Order.Asc);
            return book;
        });

        const expected_rows: typeof rows = [
            { author: "noone", numPages: null, serial: 5, title: "A book" },
            { author: "X", numPages: 100, serial: 6, title: "Another book" }
        ];

        t.deepEqual(rows, expected_rows);
    }

    const vals2: BookTable = {
        author: textCol("Y"),
        numPages: nullCol(),
        serial: numberCol(6),
        title: textCol("Dup")
    };

    const inserted1 = await insertOnConflictDoNothing(conn, bookTable, vals2, ConflictTarget.tableColumns(["serial"]));
    t.deepEqual(inserted1, false);

    {
        const rows = await query(conn, q => {
            const book = select(q, bookTable);
            order(q, book.serial, Order.Asc);
            return book;
        });

        const expected_rows: typeof rows = [
            { author: "noone", numPages: null, serial: 5, title: "A book" },
            { author: "X", numPages: 100, serial: 6, title: "Another book" }
        ];

        t.deepEqual(rows, expected_rows);
    }

    const vals3: BookTable = {
        author: textCol("Y"),
        numPages: nullCol(),
        serial: numberCol(7),
        title: textCol("Dup")
    };

    const inserted2 = await insertOnConflictDoNothing(conn, bookTable, vals3, ConflictTarget.tableColumns(["serial"]));
    t.deepEqual(inserted2, true);

    {
        const rows = await query(conn, q => {
            const book = select(q, bookTable);
            order(q, book.serial, Order.Asc);
            return book;
        });

        const expected_rows: typeof rows = [
            { author: "noone", numPages: null, serial: 5, title: "A book" },
            { author: "X", numPages: 100, serial: 6, title: "Another book" },
            { author: "Y", numPages: null, serial: 7, title: "Dup" }
        ];

        t.deepEqual(rows, expected_rows);
    }
}));

test("insert on conflict do update", t => withTestDatabase(async conn => {
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

    {
        const rows = await query(conn, q => {
            const book = select(q, bookTable);
            order(q, book.serial, Order.Asc);
            return book;
        });

        const expected_rows: typeof rows = [
            { author: "noone", numPages: null, serial: 5, title: "A book" },
            { author: "X", numPages: 100, serial: 6, title: "Another book" }
        ];

        t.deepEqual(rows, expected_rows);
    }

    const vals2: BookTable = {
        author: textCol("Y"),
        numPages: nullCol(),
        serial: numberCol(6),
        title: textCol("Dup")
    };

    const inserted2 = await insertOnConflictDoUpdate(conn,
        bookTable,
        vals2,
        ConflictTarget.tableColumns(["serial"]),
        () => booleanCol(true),
        (row) => {
            const newRow: BookTable = {
                ...row,
                numPages: nullCol()
            };
            return newRow;
        }
    );
    t.deepEqual(inserted2, true);

    {
        const rows = await query(conn, q => {
            const book = select(q, bookTable);
            order(q, book.serial, Order.Asc);
            return book;
        });

        const expected_rows: typeof rows = [
            { author: "noone", numPages: null, serial: 5, title: "A book" },
            { author: "X", numPages: null, serial: 6, title: "Another book" }
        ];

        t.deepEqual(rows, expected_rows);
    }
}));


// insert,
// insert_,
// insertOnConflictDoNothing,
// insertOnConflictDoNothing_,
// insertOnConflictDoUpdate,
// insertOnConflictDoUpdate_,
// insertMany,
// insertMany_,
// insertManyOnConflictDoNothing,
// insertManyOnConflictDoNothing_,
// insertManyOnConflictDoUpdate,
// insertManyOnConflictDoUpdate_

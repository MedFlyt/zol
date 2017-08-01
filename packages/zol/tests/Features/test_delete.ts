import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/test_db";
import { defaultValue, delete_, e, insertMany, numberCol, order, Order, pg, query, select, textCol } from "../../src/zol";
import { createPersonTableSql, PersonTable, personTable } from "./Tables";

test("delete simple 1", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const vals: PersonTable[] = [
        {
            id: defaultValue(),
            name: textCol("B"),
            age: numberCol(10)
        },
        {
            id: defaultValue(),
            name: textCol("A"),
            age: numberCol(30)
        },
        {
            id: defaultValue(),
            name: textCol("C"),
            age: numberCol(20)
        },
        {
            id: defaultValue(),
            name: textCol("D"),
            age: numberCol(20)
        }
    ];

    await insertMany(conn, personTable, vals);

    const numDeleted = await delete_(conn, personTable,
        row => e(row.name, "=", textCol("B"))
    );

    t.deepEqual(numDeleted, 1);

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        { name: "A", age: 30 },
        { name: "C", age: 20 },
        { name: "D", age: 20 }
    ];

    t.deepEqual(actual, expected);
}));

test("delete simple 2", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const vals: PersonTable[] = [
        {
            id: defaultValue(),
            name: textCol("B"),
            age: numberCol(10)
        },
        {
            id: defaultValue(),
            name: textCol("A"),
            age: numberCol(30)
        },
        {
            id: defaultValue(),
            name: textCol("C"),
            age: numberCol(20)
        },
        {
            id: defaultValue(),
            name: textCol("D"),
            age: numberCol(20)
        }
    ];

    await insertMany(conn, personTable, vals);

    const numDeleted = await delete_(conn, personTable,
        row => e(row.age, ">=", numberCol(20))
    );

    t.deepEqual(numDeleted, 3);

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        { name: "B", age: 10 }
    ];

    t.deepEqual(actual, expected);
}));

test("delete simple 3", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const vals: PersonTable[] = [
        {
            id: defaultValue(),
            name: textCol("B"),
            age: numberCol(10)
        },
        {
            id: defaultValue(),
            name: textCol("A"),
            age: numberCol(30)
        },
        {
            id: defaultValue(),
            name: textCol("C"),
            age: numberCol(20)
        },
        {
            id: defaultValue(),
            name: textCol("D"),
            age: numberCol(20)
        }
    ];

    await insertMany(conn, personTable, vals);

    const numDeleted = await delete_(conn, personTable,
        row => e(row.age, "=", numberCol(5))
    );

    t.deepEqual(numDeleted, 0);

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        { name: "A", age: 30 },
        { name: "B", age: 10 },
        { name: "C", age: 20 },
        { name: "D", age: 20 }
    ];

    t.deepEqual(actual, expected);
}));

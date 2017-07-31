import "../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../helper_framework/db";
import { defaultValue, insertMany, limit, numberCol, order, Order, pg, query, select, textCol } from "../../src/zol";
import { createPersonTableSql, PersonTable, personTable } from "./Tables";

test("limit by simple 1", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => limit(q, 0, 2, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    }));

    const expected: typeof actual = [
        { name: "A", age: 30 },
        { name: "B", age: 10 }
    ];

    t.deepEqual(actual, expected);
}));

test("limit by simple 2", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => limit(q, 1, 2, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    }));

    const expected: typeof actual = [
        { name: "B", age: 10 },
        { name: "C", age: 20 }
    ];

    t.deepEqual(actual, expected);
}));

test("limit by simple 3", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => limit(q, 1, 3, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    }));

    const expected: typeof actual = [
        { name: "B", age: 10 },
        { name: "C", age: 20 },
        { name: "D", age: 20 }
    ];

    t.deepEqual(actual, expected);
}));

test("limit by simple 4", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => limit(q, 2, 2, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    }));

    const expected: typeof actual = [
        { name: "C", age: 20 },
        { name: "D", age: 20 }
    ];

    t.deepEqual(actual, expected);
}));

test("limit by simple 5", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => limit(q, 100, 10, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    }));

    const expected: typeof actual = [
    ];

    t.deepEqual(actual, expected);
}));

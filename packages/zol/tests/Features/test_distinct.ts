import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { booleanCol, defaultValue, distinct, insertMany, numberCol, order, Order, pg, query, select, selectValues, textCol } from "../../src/zol";
import { createPersonTableSql, PersonTable, personTable } from "./Tables";

test("select distinct", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const personVals: PersonTable[] = [
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
            name: textCol("A"),
            age: numberCol(20)
        }
    ];

    await insertMany("", conn, personTable, personVals);

    const actual = await query("", conn, q => distinct(q, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name
        };
    }));

    const expected: typeof actual = [
        { name: "A" },
        { name: "B" },
        { name: "C" }
    ];

    t.deepEqual(actual, expected);
}));

test("selectValues distinct", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => distinct(q, q => {
        const fruit = selectValues(q, [
            { name: textCol("apple"), color: textCol("red"), tasty: booleanCol(true) },
            { name: textCol("orange"), color: textCol("orange"), tasty: booleanCol(true) },
            { name: textCol("banana"), color: textCol("yellow"), tasty: booleanCol(false) }
        ]);
        order(q, fruit.name, Order.Asc);
        return fruit;
    }));

    const expected: typeof actual = [
        { name: "apple", color: "red", tasty: true },
        { name: "banana", color: "yellow", tasty: false },
        { name: "orange", color: "orange", tasty: true }
    ];

    t.deepEqual(actual, expected);
}));

test("selectValues distinct 2", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => distinct(q, q => {
        const fruit = selectValues(q, [
            { name: textCol("apple"), color: textCol("red"), tasty: booleanCol(true) },
            { name: textCol("orange"), color: textCol("orange"), tasty: booleanCol(true) },
            { name: textCol("apple"), color: textCol("red"), tasty: booleanCol(true) },
            { name: textCol("banana"), color: textCol("yellow"), tasty: booleanCol(false) }
        ]);
        order(q, fruit.name, Order.Asc);
        return fruit;
    }));

    const expected: typeof actual = [
        { name: "apple", color: "red", tasty: true },
        { name: "banana", color: "yellow", tasty: false },
        { name: "orange", color: "orange", tasty: true }
    ];

    t.deepEqual(actual, expected);
}));

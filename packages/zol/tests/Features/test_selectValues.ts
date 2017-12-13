import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { booleanCol, e, order, Order, query, selectValues, textCol } from "../../src/zol";

test("selectValues 1", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        const fruit = selectValues(q, [
            { name: textCol("apple"), color: textCol("red"), tasty: booleanCol(true) },
            { name: textCol("orange"), color: textCol("orange"), tasty: booleanCol(true) },
            { name: textCol("banana"), color: textCol("yellow"), tasty: booleanCol(false) }
        ]);
        order(q, fruit.name, Order.Asc);
        return fruit;
    });

    const expected: typeof actual = [
        { name: "apple", color: "red", tasty: true },
        { name: "banana", color: "yellow", tasty: false },
        { name: "orange", color: "orange", tasty: true }
    ];

    t.deepEqual(actual, expected);
}));

test("selectValues 2", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        const fruit = selectValues(q, [
            { name: textCol("apple"), color: textCol("red"), tasty: booleanCol(true) },
            { name: textCol("orange"), color: textCol("orange"), tasty: booleanCol(true) },
            { name: textCol("banana"), color: textCol("yellow"), tasty: booleanCol(false) }
        ]);
        const person = selectValues(q, [
            { name: textCol("Alice") },
            { name: textCol("Bob") }
        ]);
        order(q, fruit.name, Order.Asc);
        order(q, person.name, Order.Asc);
        return {
            fruitName: fruit.name,
            fruitColor: fruit.color,
            fruitTasty: fruit.tasty,
            personName: person.name
        };
    });

    const expected: typeof actual = [
        { personName: "Alice", fruitName: "apple", fruitColor: "red", fruitTasty: true },
        { personName: "Alice", fruitName: "banana", fruitColor: "yellow", fruitTasty: false },
        { personName: "Alice", fruitName: "orange", fruitColor: "orange", fruitTasty: true },
        { personName: "Bob", fruitName: "apple", fruitColor: "red", fruitTasty: true },
        { personName: "Bob", fruitName: "banana", fruitColor: "yellow", fruitTasty: false },
        { personName: "Bob", fruitName: "orange", fruitColor: "orange", fruitTasty: true }
    ];

    t.deepEqual(actual, expected);
}));

test("selectValues 3", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        return selectValues(q, [
            { name: e(textCol("app"), "||", textCol("le")) }
        ]);
    });

    const expected: typeof actual = [
        { name: "apple" }
    ];

    t.deepEqual(actual, expected);
}));

test("selectValues empty", t => withTestDatabase(async conn => {
    const actual = await query("", conn, q => {
        return selectValues(q, []);
    });

    const expected: typeof actual = [];

    t.deepEqual(actual, expected);
}));

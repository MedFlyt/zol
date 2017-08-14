import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { defaultValue, e, ifThenElse, insertMany, numberCol, Order, order, pg, query, select, textCol } from "../../src/zol";
import { createPersonTableSql, PersonTable, personTable } from "./Tables";

test("ifThenElse simple 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        return {
            val: ifThenElse(e(textCol("A"), "<", textCol("B")), textCol("thenCondition"), textCol("elseCondition"))
        };
    });

    const expected: typeof actual = [{ val: "thenCondition" }];

    t.deepEqual(actual, expected);
}));

test("ifThenElse simple 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        return {
            val: ifThenElse(e(textCol("A"), ">", textCol("B")), textCol("thenCondition"), textCol("elseCondition"))
        };
    });

    const expected: typeof actual = [{ val: "elseCondition" }];

    t.deepEqual(actual, expected);
}));

test("ifThenElse nested", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);

    const personVals: PersonTable[] = [
        {
            id: defaultValue(),
            name: textCol("Link"),
            age: numberCol(125)
        },
        {
            id: defaultValue(),
            name: textCol("Velvet"),
            age: numberCol(19)
        },
        {
            id: defaultValue(),
            name: textCol("Kobayashi"),
            age: numberCol(23)
        },
        {
            id: defaultValue(),
            name: textCol("Miyu"),
            age: numberCol(10)
        }
    ];

    await insertMany(conn, personTable, personVals);

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        const ageGroup =
            ifThenElse(e(person.age, "<", numberCol(18)), textCol("Child"),
                ifThenElse(e(person.age, ">=", numberCol(65)), textCol("Elder"),
                    textCol("Adult")));
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age,
            ageGroup: ageGroup
        };
    });

    const expected: typeof actual = [
        { name: "Kobayashi", age: 23, ageGroup: "Adult" },
        { name: "Link", age: 125, ageGroup: "Elder" },
        { name: "Miyu", age: 10, ageGroup: "Child" },
        { name: "Velvet", age: 19, ageGroup: "Adult" }
    ];

    t.deepEqual(actual, expected);
}));

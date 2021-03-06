import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { arbitrary, defaultValue, exists, insertMany, numberCol, order, Order, pg, query, restrict, restrictEq, select, textCol } from "../../src/zol";
import { AddressTable, addressTable, createAddressTableSql, createPersonTableSql, PersonTable, personTable } from "./Tables";

test("exists simple", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);
    await pg.query_(conn, createAddressTableSql);

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
            name: textCol("D"),
            age: numberCol(20)
        }
    ];

    await insertMany("", conn, personTable, personVals);

    const addressVals: AddressTable[] = [
        {
            name: textCol("A"),
            city: textCol("Tokyo")
        },
        {
            name: textCol("C"),
            city: textCol("London")
        },
        {
            name: textCol("A"),
            city: textCol("New York")
        }
    ];

    await insertMany("", conn, addressTable, addressVals);

    const actual = await query("", conn, q => {
        const person = select(q, personTable);
        restrict(q, exists(q => {
            const address = select(q, addressTable);
            restrictEq(q, address.name, person.name);
            return arbitrary();
        }));
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        { name: "A", age: 30 },
        { name: "C", age: 20 }
    ];

    t.deepEqual(actual, expected);
}));

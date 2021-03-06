import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { defaultValue, e, innerJoin, insertMany, numberCol, order, Order, pg, query, select, suchThat, textCol } from "../../src/zol";
import { AddressTable, addressTable, createAddressTableSql, createPersonTableSql, PersonTable, personTable } from "./Tables";

test("inner join simple", t => withTestDatabase(async conn => {
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
        }
    ];

    await insertMany("", conn, addressTable, addressVals);

    const actual = await query("", conn, q => {
        const person = select(q, personTable);
        const personAddress = innerJoin(q,
            q => select(q, addressTable),
            row => e(row.name, "=", person.name));
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            address: personAddress.city
        };
    });

    const expected: typeof actual = [
        { name: "A", address: "Tokyo" },
        { name: "C", address: "London" }
    ];

    t.deepEqual(actual, expected);
}));

test("such that simple", t => withTestDatabase(async conn => {
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
        }
    ];

    await insertMany("", conn, addressTable, addressVals);

    const actual = await query("", conn, q => {
        const person = suchThat(q,
            q => select(q, personTable),
            row => e(row.age, ">", numberCol(25))
        );
        const personAddress = innerJoin(q,
            q => select(q, addressTable),
            row => e(row.name, "=", person.name));
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            address: personAddress.city
        };
    });

    const expected: typeof actual = [
        { name: "A", address: "Tokyo" }
    ];

    t.deepEqual(actual, expected);
}));

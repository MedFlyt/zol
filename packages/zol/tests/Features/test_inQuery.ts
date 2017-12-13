import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { Col, defaultValue, inQuery, insertMany, numberCol, order, Order, pg, query, restrict, restrictEq, select, SqlType, textCol, Unsafe } from "../../src/zol";
import { AddressTable, addressTable, createAddressTableSql, createPersonTableSql, PersonTable, personTable } from "./Tables";

function intCol<s>(val: number): Col<s, number> {
    return Unsafe.unsafeCast(numberCol(val), "INT", SqlType.numberParser);
}

test("inQuery simple", t => withTestDatabase(async conn => {
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
        restrict(q, inQuery(person.name, q => {
            const address = select(q, addressTable);
            return address.name;
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

test("inQuery renaming", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);
    await pg.query_(conn, createAddressTableSql);

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

    await insertMany("", conn, personTable, personVals);

    const addressVals: AddressTable[] = [
        {
            name: textCol("Link"),
            city: textCol("Kakariko")
        },
        {
            name: textCol("Kobayashi"),
            city: textCol("Tokyo")
        },
        {
            name: textCol("Miyu"),
            city: textCol("Fuyukishi")
        }
    ];

    await insertMany("", conn, addressTable, addressVals);

    const actual = await query("", conn, q => {
        const person = select(q, personTable);
        restrict(q, inQuery(intCol(1), q => {
            const person2 = select(q, personTable);
            const address = select(q, addressTable);
            restrictEq(q, address.name, person2.name);
            restrictEq(q, person.name, person2.name);
            restrictEq(q, address.city, textCol("Kakariko"));
            return intCol(1);
        }));
        return {
            name: person.name
        };
    });

    const expected: typeof actual = [
        { name: "Link" }
    ];

    t.deepEqual(actual, expected);
}));

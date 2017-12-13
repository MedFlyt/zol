import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { Col, Debug, defaultValue, inQuery, insertMany, numberCol, pg, query, restrict, restrictEq, select, SqlType, textCol, Unsafe } from "../../src/zol";
import { AddressTable, addressTable, createAddressTableSql, createPersonTableSql, PersonTable, personTable } from "./Tables";

function intCol<s>(val: number): Col<s, number> {
    return Unsafe.unsafeCast(numberCol(val), "INT", SqlType.numberParser);
}

test("identical sql", t => withTestDatabase(async conn => {
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

    Debug.enableDebug();

    const runQuery = async () => {
        await query("", conn, q => {
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
    };

    await runQuery();
    const sql1 = Debug.getLastQueryMetrics(conn).querySQL();
    await runQuery();
    const sql2 = Debug.getLastQueryMetrics(conn).querySQL();

    Debug.disableDebug();

    t.deepEqual(sql2, sql1);
}));

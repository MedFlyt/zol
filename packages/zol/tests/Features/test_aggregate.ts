import "../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../helper_framework/db";
import { aggregate, avg, count, defaultValue, groupBy, insertMany, max, min, numberCol, order, Order, pg, query, restrictEq, select, sum, textCol } from "../../src/zol";
import { AddressTable, addressTable, createAddressTableSql, createPersonTableSql, PersonTable, personTable } from "./Tables";

test("aggregate simple", t => withTestDatabase(async conn => {
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

    await insertMany(conn, personTable, personVals);

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

    await insertMany(conn, addressTable, addressVals);

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        const aggr = aggregate(q, q => {
            const address = select(q, addressTable);
            const owner = groupBy(q, address.name);
            return {
                name: owner,
                homes: count(address.city)
            };
        });
        restrictEq(q, aggr.name, person.name);
        order(q, aggr.homes, Order.Desc);
        return {
            name: person.name,
            homes: aggr.homes
        };
    });

    const expected: typeof actual = [
        { name: "A", homes: 2 },
        { name: "C", homes: 1 }
    ];

    t.deepEqual(actual, expected);
}));

test("aggregate sum", t => withTestDatabase(async conn => {
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
            name: textCol("D"),
            age: numberCol(20)
        }
    ];

    await insertMany(conn, personTable, personVals);

    const actual = await query(conn, q => {
        const aggr = aggregate(q, q => {
            const person = select(q, personTable);
            return {
                sumAges: sum(person.age)
            };
        });
        return {
            sumAges: aggr.sumAges
        };
    });

    const expected: typeof actual = [
        { sumAges: 80 }
    ];

    t.deepEqual(actual, expected);
}));

test("aggregate avg", t => withTestDatabase(async conn => {
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
            name: textCol("D"),
            age: numberCol(20)
        }
    ];

    await insertMany(conn, personTable, personVals);

    const actual = await query(conn, q => {
        const aggr = aggregate(q, q => {
            const person = select(q, personTable);
            return {
                averageAge: avg(person.age)
            };
        });
        return {
            averageAge: aggr.averageAge
        };
    });

    const expected: typeof actual = [
        { averageAge: 20 }
    ];

    t.deepEqual(actual, expected);
}));

test("aggregate min", t => withTestDatabase(async conn => {
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
            name: textCol("D"),
            age: numberCol(20)
        }
    ];

    await insertMany(conn, personTable, personVals);

    const actual = await query(conn, q => {
        const aggr = aggregate(q, q => {
            const person = select(q, personTable);
            return {
                minAge: min(person.age)
            };
        });
        return {
            minAge: aggr.minAge
        };
    });

    const expected: typeof actual = [
        { minAge: 10 }
    ];

    t.deepEqual(actual, expected);
}));

test("aggregate max", t => withTestDatabase(async conn => {
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
            name: textCol("D"),
            age: numberCol(20)
        }
    ];

    await insertMany(conn, personTable, personVals);

    const actual = await query(conn, q => {
        const aggr = aggregate(q, q => {
            const person = select(q, personTable);
            return {
                maxName: max(person.name)
            };
        });
        return {
            maxName: aggr.maxName
        };
    });

    const expected: typeof actual = [
        { maxName: "D" }
    ];

    t.deepEqual(actual, expected);
}));

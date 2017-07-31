import "../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../helper_framework/db";
import { defaultValue, insertMany, numberCol, order, Order, pg, query, select, textCol } from "../../src/zol";
import { createPersonTableSql, PersonTable, personTable } from "./Tables";

test("order by simple", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        {
            name: "A",
            age: 30
        },
        {
            name: "B",
            age: 10
        },
        {
            name: "C",
            age: 20
        },
        {
            name: "D",
            age: 20
        }
    ];

    t.deepEqual(actual, expected);
}));

test("order by simple desc", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Desc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        {
            name: "D",
            age: 20
        },
        {
            name: "C",
            age: 20
        },
        {
            name: "B",
            age: 10
        },
        {
            name: "A",
            age: 30
        }
    ];

    t.deepEqual(actual, expected);
}));

test("order by two fields", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        order(q, person.age, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        {
            name: "B",
            age: 10
        },
        {
            name: "C",
            age: 20
        },
        {
            name: "D",
            age: 20
        },
        {
            name: "A",
            age: 30
        }
    ];

    t.deepEqual(actual, expected);
}));

test("order by two fields2", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Desc);
        order(q, person.age, Order.Asc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        {
            name: "B",
            age: 10
        },
        {
            name: "D",
            age: 20
        },
        {
            name: "C",
            age: 20
        },
        {
            name: "A",
            age: 30
        }
    ];

    t.deepEqual(actual, expected);
}));

test("order by two fields3", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Asc);
        order(q, person.age, Order.Desc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        {
            name: "A",
            age: 30
        },
        {
            name: "C",
            age: 20
        },
        {
            name: "D",
            age: 20
        },
        {
            name: "B",
            age: 10
        }
    ];

    t.deepEqual(actual, expected);
}));

test("order by two fields3", t => withTestDatabase(async conn => {
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

    const actual = await query(conn, q => {
        const person = select(q, personTable);
        order(q, person.name, Order.Desc);
        order(q, person.age, Order.Desc);
        return {
            name: person.name,
            age: person.age
        };
    });

    const expected: typeof actual = [
        {
            name: "A",
            age: 30
        },
        {
            name: "D",
            age: 20
        },
        {
            name: "C",
            age: 20
        },
        {
            name: "B",
            age: 10
        }
    ];

    t.deepEqual(actual, expected);
}));

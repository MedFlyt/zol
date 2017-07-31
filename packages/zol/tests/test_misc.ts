import "../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../helper_framework/db";
import { query } from "../src/Frontend";
import * as m from "../src/Imperative";
import { pg } from "../src/pg";
import { age10Years, allPeople2, allPersons, allPersonsWithLimit, countHomes, grownups, grownupsIn, insertPeople, peopleInAddresses, setDefaultAge } from "./Queries/SimpleQueries";
import * as imp from "./Queries/SimpleQueriesImperative";
import { createAddressSql } from "./Tables/Address";
import { createPersonSql, personDefaultAge } from "./Tables/Person";
import Client = pg.Client;
import query_ = pg.query_;

async function withAllTables<A>(action: (conn: Client) => Promise<A>): Promise<A> {
    return withTestDatabase(async (conn: Client) => {
        await query_(conn, createPersonSql);
        await query_(conn, createAddressSql);

        return action(conn);
    });
}

async function insertSamplePersons(conn: Client): Promise<void> {
    await query_(conn,
        `
        INSERT INTO person (
            name,
            age
        )
        VALUES
            ('Link'      , 125),
            ('Velvet'    , 19),
            ('Kobayashi' , 23),
            ('Miyu'      , 10)
        `);
}

async function insertSampleAddresses(conn: Client): Promise<void> {
    await query_(conn,
        `
        INSERT INTO address (
            name,
            city
        )
        VALUES
            ('Link'      , 'Kakariko'),
            ('Kobayashi' , 'Tokyo'),
            ('Miyu'      , 'Fuyukishi')
        `);
}

test("allPersons", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await query(conn, allPersons());

    const expected: typeof persons = [
        {
            name: "Link",
            age: 125
        },
        {
            name: "Velvet",
            age: 19
        },
        {
            name: "Kobayashi",
            age: 23
        },
        {
            name: "Miyu",
            age: 10
        }
    ];

    t.deepEqual(persons, expected);
}));

test("grownups", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await query(conn, grownups());

    const expected: typeof persons = [
        {
            grownupName: "Link"
        },
        {
            grownupName: "Kobayashi"
        }
    ];

    t.deepEqual(persons, expected);
}));

test("grownupsIn", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await query(conn, grownupsIn("Tokyo"));

    const expected: typeof persons = [
        {
            grownupName: "Kobayashi"
        }
    ];

    t.deepEqual(persons, expected);
}));

test("allPeople2", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await query(conn, allPeople2());

    const expected: typeof persons = [
        {
            name: "Kobayashi",
            city: "Tokyo"
        },
        {
            name: "Link",
            city: "Kakariko"
        },
        {
            name: "Miyu",
            city: "Fuyukishi"
        },
        {
            name: "Velvet",
            city: null
        }
    ];

    t.deepEqual(persons, expected);
}));

test("countHomes", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await query(conn, countHomes());

    const expected: typeof persons = [
        {
            name: "Link",
            homes: 1
        },
        {
            name: "Kobayashi",
            homes: 1
        },
        {
            name: "Miyu",
            homes: 1
        }
    ];

    t.deepEqual(persons, expected);
}));

test("imperative allPersons", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await m.query(conn, imp.allPersons);

    const expected: typeof persons = [
        {
            name: "Link",
            age: 125
        },
        {
            name: "Velvet",
            age: 19
        },
        {
            name: "Kobayashi",
            age: 23
        },
        {
            name: "Miyu",
            age: 10
        }
    ];

    t.deepEqual(persons, expected);
}));

test("imperative grownups", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await m.query(conn, imp.grownups);

    const expected: typeof persons = [
        {
            grownupName: "Link"
        },
        {
            grownupName: "Kobayashi"
        }
    ];

    t.deepEqual(persons, expected);
}));

test("imperative grownupsIn", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await m.query(conn, q => imp.grownupsIn(q, "Tokyo"));

    const expected: typeof persons = [
        {
            grownupName: "Kobayashi"
        }
    ];

    t.deepEqual(persons, expected);
}));

test("imperative allPeople2", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await m.query(conn, imp.allPeople2);

    const expected: typeof persons = [
        {
            name: "Kobayashi",
            city: "Tokyo"
        },
        {
            name: "Link",
            city: "Kakariko"
        },
        {
            name: "Miyu",
            city: "Fuyukishi"
        },
        {
            name: "Velvet",
            city: null
        }
    ];

    t.deepEqual(persons, expected);
}));

test("imperative countHomes", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await m.query(conn, imp.countHomes);

    const expected: typeof persons = [
        {
            name: "Link",
            homes: 1
        },
        {
            name: "Kobayashi",
            homes: 1
        },
        {
            name: "Miyu",
            homes: 1
        }
    ];

    t.deepEqual(persons, expected);
}));

test("imperative specialPeople", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await m.query(conn, imp.specialPeople);

    const expected: typeof persons = [
        {
            name: "Link",
            age: 125
        },
        {
            name: "Miyu",
            age: 10
        }
    ];

    t.deepEqual(persons, expected);
}));

test("imperative noOne", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await m.query(conn, imp.noOne);

    const expected: typeof persons = [];

    t.deepEqual(persons, expected);
}));

test("peopleInAddresses", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await query(conn, peopleInAddresses());

    const expected: typeof persons = [
        {
            name: "Link",
            age: 125
        },
        {
            name: "Kobayashi",
            age: 23
        },
        {
            name: "Miyu",
            age: 10
        }
    ];

    t.deepEqual(persons, expected);
}));

test("imperative peopleInAddresses", t => withAllTables(async conn => {
    await insertSamplePersons(conn);
    await insertSampleAddresses(conn);

    const persons = await m.query(conn, imp.peopleInAddresses);

    const expected: typeof persons = [
        {
            name: "Link",
            age: 125
        },
        {
            name: "Kobayashi",
            age: 23
        },
        {
            name: "Miyu",
            age: 10
        }
    ];

    t.deepEqual(persons, expected);
}));

test("age10Years", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    await age10Years(conn);
    const persons = await query(conn, allPersons());

    const expected: typeof persons = [
        {
            name: "Velvet",
            age: 19
        },
        {
            name: "Kobayashi",
            age: 23
        },
        {
            name: "Miyu",
            age: 10
        },
        {
            name: "Link",
            age: 500
        }
    ];

    t.deepEqual(persons, expected);
}));

test("setDefaultAge", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    await setDefaultAge(conn, "Miyu");
    const persons = await query(conn, allPersons());

    const expected: typeof persons = [
        {
            name: "Link",
            age: 125
        },
        {
            name: "Velvet",
            age: 19
        },
        {
            name: "Kobayashi",
            age: 23
        },
        {
            name: "Miyu",
            age: personDefaultAge
        }
    ];

    t.deepEqual(persons, expected);
}));

test("insertAlice", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const ages = await insertPeople(conn);
    t.deepEqual(ages, [personDefaultAge, 30]);
    const persons = await query(conn, allPersons());

    const expected: typeof persons = [
        {
            name: "Link",
            age: 125
        },
        {
            name: "Velvet",
            age: 19
        },
        {
            name: "Kobayashi",
            age: 23
        },
        {
            name: "Miyu",
            age: 10
        },
        {
            name: "Alice",
            age: personDefaultAge
        },
        {
            name: "Bob",
            age: 30
        }
    ];

    t.deepEqual(persons, expected);
}));

test("allPersonsWithLimit 1", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await query(conn, allPersonsWithLimit(0, 2));

    const expected: typeof persons = [
        { name: "Kobayashi", age: 23 },
        { name: "Link", age: 125 }
    ];

    t.deepEqual(persons, expected);
}));

test("allPersonsWithLimit 2", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await query(conn, allPersonsWithLimit(0, 3));

    const expected: typeof persons = [
        { name: "Kobayashi", age: 23 },
        { name: "Link", age: 125 },
        { name: "Miyu", age: 10 }
    ];

    t.deepEqual(persons, expected);
}));

test("allPersonsWithLimit 3", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await query(conn, allPersonsWithLimit(1, 3));

    const expected: typeof persons = [
        { name: "Link", age: 125 },
        { name: "Miyu", age: 10 },
        { name: "Velvet", age: 19 }
    ];

    t.deepEqual(persons, expected);
}));

test("allPersonsWithLimit 3", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await query(conn, allPersonsWithLimit(2, 2));

    const expected: typeof persons = [
        { name: "Miyu", age: 10 },
        { name: "Velvet", age: 19 }
    ];

    t.deepEqual(persons, expected);
}));

test("allPersonsWithLimit 4", t => withAllTables(async conn => {
    await insertSamplePersons(conn);

    const persons = await query(conn, allPersonsWithLimit(100, 10));

    const expected: typeof persons = [
    ];

    t.deepEqual(persons, expected);
}));

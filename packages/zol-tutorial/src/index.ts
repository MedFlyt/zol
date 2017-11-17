import { pg } from "zol";
import { declareTable, MakeCols, MakeTable, SqlType, Table, insertMany, textCol, numberCol, defaultValue, delete_, e, Col, select, restrict, query, Q } from "zol";

// --------------------------------------------------------------------
// Connecting To a Database
// --------------------------------------------------------------------

export async function connect(): Promise<pg.Client> {
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // !!! Modify the following line with your database credentials !!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    const conn = await pg.connectPg("postgres://myuser:mypassword@localhost:5432/dbname");
    return conn;
}

// --------------------------------------------------------------------
// Declaring Tables
// --------------------------------------------------------------------

const createPersonTableSql =
    `
    CREATE TABLE person
    (
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        age INT NOT NULL DEFAULT 0
    );
    `;

export async function createPersonTable(conn: pg.Client) {
    await pg.query_(conn, createPersonTableSql);
}

export interface PersonReq {
    readonly firstName: string;
    readonly lastName: string;
}

export interface PersonDef {
    readonly age: number;
}

export const personTable = declareTable<PersonReq, PersonDef>("person", {
    firstName: ["first_name", SqlType.stringParser],
    lastName: ["last_name", SqlType.stringParser],
    age: ["age", SqlType.intParser]
});

export type PersonCols<s> = MakeCols<s, PersonReq & PersonDef>;
export type PersonTable = MakeTable<PersonReq, PersonDef>;

// --------------------------------------------------------------------
// Inserting Rows
// --------------------------------------------------------------------

export async function insertPeople(conn: pg.Client) {
    const vals: PersonTable[] = [
        {
            firstName: textCol("John"),
            lastName: textCol("Blah"),
            age: numberCol(3)
        },
        {
            firstName: textCol("John"),
            lastName: textCol("Blah"),
            age: numberCol(24)
        }
    ];

    await insertMany(conn, personTable, vals);
}

// --------------------------------------------------------------------
// Basic Queries
// --------------------------------------------------------------------

function selectJohn<s>(q: Q<s>) {
    const person = select(q, personTable);
    restrict(q, e(person.firstName, "=", textCol("John")));
    return person;
}

function selectAdults<s>(q: Q<s>) {
    const person = select(q, personTable);
    restrict(q, e(person.age, ">=", numberCol(18)));
    return person;
}

async function runQuery(conn: pg.Client): Promise<void> {
    const resultRows = await query(conn, q => selectJohn(q));
    for (const resultRow of resultRows) {
        console.log(resultRow.firstName, resultRow.lastName, resultRow.age);
    }
}

export function isAdult<s>(person: PersonCols<s>): Col<s, boolean> {
    return e(person.age, ">=", numberCol(18));
}

// --------------------------------------------------------------------
// Aggregations
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Left Join
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Order
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Limit
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Inner Queries
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Updating Rows
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Deleting Rows
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Primary Keys
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Type safe foreign keys
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Insert with ON CONFLICT clause (upsert)
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Transactions
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// More Features
// --------------------------------------------------------------------

// distinct, ifThenElse, matchNull, inList, isNull, isNotNull, not

// --------------------------------------------------------------------
// Unsafe Functions
// --------------------------------------------------------------------

// --------------------------------------------------------------------
// Debugging Queries
// --------------------------------------------------------------------

export async function deletePeople(conn: pg.Client) {
    delete_(conn, personTable,
        row => e(
            e(row.firstName, "=", textCol("Foo")),
            "AND",
            e(row.lastName, "=", textCol("Bar"))
        )
    );

    delete_(conn, personTable,
        row => isAdult(row)
    );
}

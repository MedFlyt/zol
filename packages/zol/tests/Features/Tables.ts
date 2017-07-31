import { declareTable, MakeCols, MakeTable, SqlType } from "../../src/zol";

// --------------------------------------------------------------------

export const createPersonTableSql = `
    CREATE TABLE person (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        age INT NOT NULL
    );
`;

interface PersonReq {
    readonly name: string;
    readonly age: number;
}

interface PersonDef {
    readonly id: number;
}

export type PersonCols<s> = MakeCols<s, PersonReq & PersonDef>;
export type PersonTable = MakeTable<PersonReq, PersonDef>;

export const personTable = declareTable<PersonReq, PersonDef>("person", [
    ["id", "id", SqlType.numberParser],
    ["name", "name", SqlType.stringParser],
    ["age", "age", SqlType.numberParser]
]);

// --------------------------------------------------------------------

export const createAddressTableSql =
    `
    CREATE TABLE address (
        name TEXT NOT NULL,
        city TEXT NOT NULL
    )
    `;

export interface AddressReq {
    readonly name: string;
    readonly city: string;
}

export type AddressCols<s> = MakeCols<s, AddressReq & {}>;
export type AddressTable = MakeTable<AddressReq, {}>;

export const addressTable = declareTable<AddressReq, {}>("address", [
    ["name", "name", SqlType.stringParser],
    ["city", "city", SqlType.stringParser]
]);

// --------------------------------------------------------------------

export const createBookTableSql = `
    CREATE TABLE book (
        title_col TEXT NOT NULL,
        author_col TEXT NOT NULL DEFAULT 'noone',
        serial_col INT NOT NULL UNIQUE,
        "numPages" INT,

        UNIQUE (title_col, author_col)
    );
`;

export const bookDefaultAuthor = "noone";

interface BookReq {
    readonly title: string;
    readonly serial: number;
}

interface BookDef {
    readonly author: string;
    readonly numPages: number | null;
}

export type BookCols<s> = MakeCols<s, BookReq & BookDef>;
export type BookTable = MakeTable<BookReq, BookDef>;

export const bookTable = declareTable<BookReq, BookDef>("book", [
    ["title_col", "title", SqlType.stringParser],
    ["author_col", "author", SqlType.stringParser],
    ["serial_col", "serial", SqlType.numberParser],
    ["numPages", "numPages", SqlType.numberParser]
]);

// --------------------------------------------------------------------

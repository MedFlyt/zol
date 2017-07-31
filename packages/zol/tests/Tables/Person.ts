import { MakeCols, MakeTable } from "../../src/Query";
import { SqlType } from "../../src/SqlType";
import { declareTable } from "../../src/Table";

interface PersonReq {
    readonly name: string;
}

interface PersonDef {
    readonly age: number;
}

export type PersonCols<s> = MakeCols<s, PersonReq & PersonDef>;
export type PersonTable = MakeTable<PersonReq, PersonDef>;

export const personTable = declareTable<PersonReq, PersonDef>("person", [
    ["name", "name", SqlType.stringParser],
    ["age", "age", SqlType.numberParser]
]);

export const personDefaultAge = 18;

export const createPersonSql =
    `
    CREATE TABLE person (
        name TEXT NOT NULL,
        age INT NOT NULL DEFAULT ${personDefaultAge}
    )
    `;

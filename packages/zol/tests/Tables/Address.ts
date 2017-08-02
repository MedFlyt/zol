import { declareTable } from "../../src/Table";
import { SqlType } from "../../src/zol";

export interface Address {
    readonly name: string;
    readonly city: string;
}

export const addressTable = declareTable<Address, {}>("address", {
    name: ["name", SqlType.stringParser],
    city: ["city", SqlType.stringParser]
});

export const createAddressSql =
    `
    CREATE TABLE address (
        name TEXT NOT NULL,
        city TEXT NOT NULL
    )
    `;

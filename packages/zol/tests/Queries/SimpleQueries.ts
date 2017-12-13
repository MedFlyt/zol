import { Col, numberCol, textCol } from "../../src/Column";
import { e } from "../../src/e";
import { insertManyReturning } from "../../src/Insert";
import { pg } from "../../src/pg";
import { aggregate, count, defaultValue, groupBy, inQuery, leftJoin, limit, order, restrict, select, selectValues } from "../../src/Query";
import { Query, queryBind, queryPure } from "../../src/Query/Type";
import { Order } from "../../src/SQL";
import { update } from "../../src/Update";
import { addressTable } from "../Tables/Address";
import { PersonCols, personTable, PersonTable } from "../Tables/Person";

import Client = pg.Client;

export async function insertPeople(conn: Client): Promise<number[]> {
    const values: PersonTable[] = [
        {
            name: textCol("Alice"),
            age: defaultValue()
        },
        {
            name: textCol("Bob"),
            age: numberCol(30)
        }
    ];

    const inserted = await insertManyReturning("", conn,
        personTable, values,
        person => {
            return {
                age: person.age
            };
        });
    if (inserted.length !== values.length) {
        throw new Error("Insert failed");
    }
    return inserted.map(x => x.age);
}

export function allPersons<s>(): Query<s, PersonCols<s>> {
    return queryBind(
        select(personTable),
        person =>
            queryBind
                (queryPure({}),
                () =>
                    queryPure({
                        ...person
                    })
                )
    );
}

export function grownups<s>(): Query<s, { grownupName: Col<s, string> }> {
    return queryBind(
        select(personTable),
        person => queryBind(
            restrict(e(person.age, ">", numberCol(20))),
            () => queryPure({
                grownupName: person.name
            })
        )
    );
}

export function grownupsIn<s>(city: string): Query<s, { grownupName: Col<s, string> }> {
    return queryBind(
        select(personTable),
        person => queryBind(
            restrict(e(person.age, ">", numberCol(20))),
            () => queryBind(
                select(addressTable),
                address => queryBind(
                    restrict(e(address.city, "=", textCol(city))),
                    () => queryBind(
                        restrict(e(address.name, "=", person.name)),
                        () => queryPure({
                            grownupName: person.name
                        })
                    )
                )
            )
        )
    );
}

export function allPeople2<s>(): Query<s, { name: Col<s, string>, city: Col<s, string | null> }> {
    return queryBind(
        select(personTable),
        person => queryBind(
            leftJoin(
                select(addressTable),
                address => e(person.name, "=", address.name)
            ),
            j => queryPure({
                name: person.name,
                city: j.city
            })
        )
    );
}

export function countHomes<s>(): Query<s, { name: Col<s, string>, homes: Col<s, number> }> {
    return queryBind(
        select(personTable),
        person => queryBind(
            aggregate(
                queryBind(
                    select(addressTable),
                    address => queryBind(
                        groupBy(address.name),
                        owner2 => queryPure({
                            owner: owner2,
                            homes: count(address.city)
                        })
                    )
                )
            ),
            aggr => queryBind(
                restrict(e(aggr.owner, "=", person.name)),
                () => queryPure({
                    name: aggr.owner,
                    homes: aggr.homes
                })
            )
        )
    );
}

export function peopleInAddresses<s>(): Query<s, PersonCols<s>> {
    return queryBind(
        select(personTable),
        person => queryBind(
            restrict(inQuery(person.name,
                queryBind(
                    select(addressTable),
                    address => queryPure(address.name)
                ))),
            () => queryPure(person)
        )
    );
}

export async function age10Years(conn: Client): Promise<void> {
    await update("", conn,
        personTable,
        person => e(person.name, "=", textCol("Link")),
        person => {
            const result: PersonTable = {
                ...person,
                age: numberCol(500)
            };
            return result;
        });
}

export async function setDefaultAge(conn: Client, personName: string): Promise<void> {
    await update("", conn,
        personTable,
        person => e(person.name, "=", textCol(personName)),
        person => {
            const result: PersonTable = {
                ...person,
                age: defaultValue()
            };
            return result;
        });
}

export function allPersonsWithLimit<s>(offset: number, lim: number): Query<s, PersonCols<s>> {
    return limit(offset, lim,
        queryBind(
            select(personTable),
            person =>
                queryBind(
                    order(person.name, Order.Asc),
                    () =>
                        queryPure({
                            ...person
                        })
                )
        ));
}


export function adhocTest<s>(): Query<s, {
    foo: Col<s, string>;
    bar: Col<s, string>;
    blah: Col<s, number>;
}> {
    return queryBind(
        selectValues<s, { foo: string, bar: string, blah: number }>([
            {
                foo: textCol("foo1"),
                bar: textCol("bar1"),
                blah: numberCol(4)
            },
            {
                foo: textCol("foo2"),
                bar: textCol("bar2"),
                blah: numberCol(5)
            }
        ]),
        person =>
            queryBind
                (queryPure(person.bar),
                () =>
                    queryPure({
                        ...person
                    })
                )
    );
}

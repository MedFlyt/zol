import { Col, numberCol, textCol } from "../../src/Column";
import { e } from "../../src/e";
import { aggregate, groupBy, inQuery, leftJoin, Q, restrict, select } from "../../src/Imperative";
import { count, inList } from "../../src/Query";
import { addressTable } from "../Tables/Address";
import { PersonCols, personTable } from "../Tables/Person";

export function allPersons<s>(q: Q<s>): PersonCols<s> {
    const person = select(q, personTable);
    return person;
}

export function grownups<s>(q: Q<s>): { grownupName: Col<s, string>; } {
    const person = select(q, personTable);
    restrict(q, e(person.age, ">", numberCol(20)));
    return {
        grownupName: person.name
    };
}

export function grownupsIn<s>(q: Q<s>, city: string): { grownupName: Col<s, string> } {
    const person = select(q, personTable);
    restrict(q, e(person.age, ">", numberCol(20)));
    const address = select(q, addressTable);
    restrict(q, e(address.city, "=", textCol(city)));
    restrict(q, e(address.name, "=", person.name));
    return {
        grownupName: person.name
    };
}

export function allPeople2<s>(q: Q<s>): { name: Col<s, string>, city: Col<s, string | null> } {
    const person = select(q, personTable);
    const j = leftJoin(q,
        q => select(q, addressTable),
        address => e(person.name, "=", address.name));
    return {
        name: person.name,
        city: j.city
    };
}

export function countHomes<s>(q: Q<s>): { name: Col<s, string>, homes: Col<s, number> } {
    const person = select(q, personTable);
    const aggr = aggregate(q, q2 => {
        const address = select(q2, addressTable);
        const owner2 = groupBy(q2, address.name);
        return {
            owner: owner2,
            homes: count(address.city)
        };
    });
    restrict(q, e(aggr.owner, "=", person.name));
    return {
        name: aggr.owner,
        homes: aggr.homes
    };
}

export function specialPeople<s>(q: Q<s>): PersonCols<s> {
    const person = select(q, personTable);
    restrict(q, inList(person.name, [textCol("Link"), textCol("Miyu"), textCol("on one")]));
    return person;
}

export function noOne<s>(q: Q<s>): PersonCols<s> {
    const person = select(q, personTable);
    restrict(q, inList(person.name, []));
    return person;
}

export function peopleInAddresses<s>(q: Q<s>): PersonCols<s> {
    const person = select(q, personTable);
    restrict(q, inQuery(person.name, q => {
        const address = select(q, addressTable);
        return address.name;
    }));
    return person;
}

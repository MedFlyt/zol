import { parseZonedDateTime } from "../src/Parsers";

import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";

test("date time with offset", async t => {
    const actual = parseZonedDateTime("2017-08-02 12:41:31.194+02");
    t.deepEqual(actual.toString(), "2017-08-02T12:41:31.194+02:00");
});

test("date time no offset", async t => {
    const actual = parseZonedDateTime("2017-08-02 12:41:31.194");
    t.deepEqual(actual.toString(), "2017-08-02T12:41:31.194Z");
});

test("date time no nanos", async t => {
    const actual = parseZonedDateTime("2017-08-02 12:41:31");
    t.deepEqual(actual.toString(), "2017-08-02T12:41:31Z");
});

test("date time with nanos", async t => {
    const actual = parseZonedDateTime("2017-08-02 12:41:31.194324626");
    t.deepEqual(actual.toString(), "2017-08-02T12:41:31.194324626Z");
});

test("date time with nanos and offset", async t => {
    const actual = parseZonedDateTime("2017-08-02 12:41:31.194324626-04");
    t.deepEqual(actual.toString(), "2017-08-02T12:41:31.194324626-04:00");
});

test("date time offset minutes", async t => {
    const actual = parseZonedDateTime("2017-08-02 12:41:31.194+01:30");
    t.deepEqual(actual.toString(), "2017-08-02T12:41:31.194+01:30");
});

import { parseLocalDate, parseLocalTime, parseZonedDateTime } from "../src/Parsers";

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

test("local date", async t => {
    const actual = parseLocalDate("2017-08-02");
    t.deepEqual(actual.toString(), "2017-08-02");
});

test("local time 1", async t => {
    const actual = parseLocalTime("13:30:00");
    t.deepEqual(actual.toString(), "13:30");
});

test("local time 2", async t => {
    const actual = parseLocalTime("13:30:59");
    t.deepEqual(actual.toString(), "13:30:59");
});

test("local time 3", async t => {
    const actual = parseLocalTime("11:30:59");
    t.deepEqual(actual.toString(), "11:30:59");
});

test("local time 4", async t => {
    const actual = parseLocalTime("01:00:01");
    t.deepEqual(actual.toString(), "01:00:01");
});

test("local time 5", async t => {
    const actual = parseLocalTime("00:00:00");
    t.deepEqual(actual.toString(), "00:00");
});

test("local time 6", async t => {
    const actual = parseLocalTime("23:59:00");
    t.deepEqual(actual.toString(), "23:59");
});

test("local time 7", async t => {
    const actual = parseLocalTime("23:59:59");
    t.deepEqual(actual.toString(), "23:59:59");
});

test("local time 8", async t => {
    const actual = parseLocalTime("23:59:59.9");
    t.deepEqual(actual.toString(), "23:59:59.900");
});

test("local time 9", async t => {
    const actual = parseLocalTime("23:59:59.99");
    t.deepEqual(actual.toString(), "23:59:59.990");
});

test("local time 10", async t => {
    const actual = parseLocalTime("23:59:59.999");
    t.deepEqual(actual.toString(), "23:59:59.999");
});

test("local time 11", async t => {
    const actual = parseLocalTime("23:59:59.9999");
    t.deepEqual(actual.toString(), "23:59:59.999900");
});

test("local time 12", async t => {
    const actual = parseLocalTime("23:59:59.99999");
    t.deepEqual(actual.toString(), "23:59:59.999990");
});

test("local time 13", async t => {
    const actual = parseLocalTime("23:59:59.999999");
    t.deepEqual(actual.toString(), "23:59:59.999999");
});

test("local time 14", async t => {
    const actual = parseLocalTime("12:00:00.001");
    t.deepEqual(actual.toString(), "12:00:00.001");
});

test("local time 15", async t => {
    const actual = parseLocalTime("12:00:00.620572");
    t.deepEqual(actual.toString(), "12:00:00.620572");
});

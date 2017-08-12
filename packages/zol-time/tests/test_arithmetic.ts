import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { Duration, Instant } from "js-joda/dist/js-joda";
import { query } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { durationCol, instantAdd, instantCol, instantSubtract } from "../src/zol-time";

test("instantAdd 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(100)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490238100);
}));

test("instantAdd 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(1000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490239000);
}));

test("instantAdd 3", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(10000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490248000);
}));

test("instantAdd 4", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(100000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490338000);
}));

test("instantAdd 5", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(1000000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1491238000);
}));

test("instantAdd 6", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(10000000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1500238000);
}));

test("instantAdd 7", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(100000000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1590238000);
}));

test("instantSubtract 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(100)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490237900);
}));

test("instantSubtract 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(1000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490237000);
}));

test("instantSubtract 3", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(10000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490228000);
}));

test("instantSubtract 4", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(100000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490138000);
}));

test("instantSubtract 5", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(1000000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1489238000);
}));

test("instantSubtract 6", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(10000000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1480238000);
}));

test("instantSubtract 7", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(100000000)))
    }));

    t.equal(actual[0].val.epochSecond(), 1390238000);
}));

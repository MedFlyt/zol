import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { LocalTime } from "js-joda";
import { query } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { localTimeCol } from "../src/zol-datetime";

test("local time simple 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeCol(LocalTime.of(13, 30, 0))
    }));

    t.equal(actual[0].val.toString(), "13:30");
}));

test("local time simple 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeCol(LocalTime.of(13, 30, 56))
    }));

    t.equal(actual[0].val.toString(), "13:30:56");
}));

test("local time simple 3", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeCol(LocalTime.of(0, 0))
    }));

    t.equal(actual[0].val.toString(), "00:00");
}));

test("local time simple 4", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeCol(LocalTime.of(12, 0, 0, 402000000))
    }));

    t.equal(actual[0].val.toString(), "12:00:00.402");
}));

test("local time simple 5", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeCol(LocalTime.of(23, 59, 59, 999999000))
    }));

    t.equal(actual[0].val.toString(), "23:59:59.999999");
}));

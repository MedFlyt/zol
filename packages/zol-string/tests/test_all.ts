import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { Col, numberCol, query, SqlType, textCol, Unsafe } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { btrim, charLength, chr, lower, ltrim, rtrim, strpos, substr, toHex, upper } from "../src/zol-string";

function bigintCol<s>(val: number): Col<s, number> {
    return Unsafe.unsafeCast(numberCol(val), "BIGINT", SqlType.numberParser);
}

test("charLength", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: charLength(textCol("Hello"))
    }));

    const expected_r1: typeof r1 = [{ val: 5 }];

    t.deepEqual(r1, expected_r1);
}));

test("lower", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: lower(textCol("Hello"))
    }));

    const expected_r1: typeof r1 = [{ val: "hello" }];

    t.deepEqual(r1, expected_r1);
}));

test("upper", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: upper(textCol("Hello"))
    }));

    const expected_r1: typeof r1 = [{ val: "HELLO" }];

    t.deepEqual(r1, expected_r1);
}));

test("strpos result", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: strpos(textCol("high"), textCol("ig"))
    }));

    const expected_r1: typeof r1 = [{ val: 2 }];

    t.deepEqual(r1, expected_r1);
}));

test("strpos no result", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: strpos(textCol("high"), textCol("x"))
    }));

    const expected_r1: typeof r1 = [{ val: 0 }];

    t.deepEqual(r1, expected_r1);
}));

test("substr 1", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: substr(textCol("alphabet"), numberCol(3))
    }));

    const expected_r1: typeof r1 = [{ val: "phabet" }];

    t.deepEqual(r1, expected_r1);
}));

test("substr 2", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: substr(textCol("alphabet"), numberCol(3), numberCol(2))
    }));

    const expected_r1: typeof r1 = [{ val: "ph" }];

    t.deepEqual(r1, expected_r1);
}));

test("substr 3", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: substr(textCol("alphabet"), numberCol(8), numberCol(2))
    }));

    const expected_r1: typeof r1 = [{ val: "t" }];

    t.deepEqual(r1, expected_r1);
}));

test("substr 4", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: substr(textCol("alphabet"), numberCol(9))
    }));

    const expected_r1: typeof r1 = [{ val: "" }];

    t.deepEqual(r1, expected_r1);
}));

test("chr", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: chr(numberCol(65))
    }));

    const expected_r1: typeof r1 = [{ val: "A" }];

    t.deepEqual(r1, expected_r1);
}));

test("chr unicode", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: chr(numberCol(937))
    }));

    const expected_r1: typeof r1 = [{ val: "\u03A9" }];

    t.deepEqual(r1, expected_r1);
}));

test("btrim 1", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: btrim(textCol(" Test"))
    }));

    const expected_r1: typeof r1 = [{ val: "Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("btrim 2", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: btrim(textCol("Test  "))
    }));

    const expected_r1: typeof r1 = [{ val: "Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("btrim 3", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: btrim(textCol(" Test "))
    }));

    const expected_r1: typeof r1 = [{ val: "Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("btrim 4", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: btrim(textCol("\t Test "))
    }));

    const expected_r1: typeof r1 = [{ val: "\t Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("btrim 5", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: btrim(textCol("xyxtrimyyx"), textCol("xyz"))
    }));

    const expected_r1: typeof r1 = [{ val: "trim" }];

    t.deepEqual(r1, expected_r1);
}));

test("ltrim 1", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: ltrim(textCol(" Test"))
    }));

    const expected_r1: typeof r1 = [{ val: "Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("ltrim 2", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: ltrim(textCol("Test  "))
    }));

    const expected_r1: typeof r1 = [{ val: "Test  " }];

    t.deepEqual(r1, expected_r1);
}));

test("ltrim 3", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: ltrim(textCol(" Test "))
    }));

    const expected_r1: typeof r1 = [{ val: "Test " }];

    t.deepEqual(r1, expected_r1);
}));

test("ltrim 4", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: ltrim(textCol("\t Test "))
    }));

    const expected_r1: typeof r1 = [{ val: "\t Test " }];

    t.deepEqual(r1, expected_r1);
}));

test("ltrim 5", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: ltrim(textCol("xyxtrimyyx"), textCol("xyz"))
    }));

    const expected_r1: typeof r1 = [{ val: "trimyyx" }];

    t.deepEqual(r1, expected_r1);
}));

test("rtrim 1", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: rtrim(textCol(" Test"))
    }));

    const expected_r1: typeof r1 = [{ val: " Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("rtrim 2", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: rtrim(textCol("Test  "))
    }));

    const expected_r1: typeof r1 = [{ val: "Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("rtrim 3", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: rtrim(textCol(" Test "))
    }));

    const expected_r1: typeof r1 = [{ val: " Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("rtrim 4", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: rtrim(textCol("\t Test "))
    }));

    const expected_r1: typeof r1 = [{ val: "\t Test" }];

    t.deepEqual(r1, expected_r1);
}));

test("rtrim 5", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: rtrim(textCol("xyxtrimyyx"), textCol("xyz"))
    }));

    const expected_r1: typeof r1 = [{ val: "xyxtrim" }];

    t.deepEqual(r1, expected_r1);
}));

test("toHex", t => withTestDatabase(async conn => {
    const r1 = await query("", conn, _q => ({
        val: toHex(bigintCol(2147483647))
    }));

    const expected_r1: typeof r1 = [{ val: "7fffffff" }];

    t.deepEqual(r1, expected_r1);
}));

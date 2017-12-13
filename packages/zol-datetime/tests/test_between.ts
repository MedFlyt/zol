import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { Duration, Instant } from "js-joda";
import { query } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { durationBetween, instantCol } from "../src/zol-datetime";

test("between instants long time span", t => withTestDatabase(async conn => {
    const startEpoch = 1490238000;
    const increment = 12 * 60 * 60;
    const actuals: number[] = [];
    const expecteds: number[] = [];
    for (let i = 0; i < 63072000; i += increment) {
        const actual = await query("", conn, _q => ({
            val: durationBetween(instantCol(Instant.ofEpochSecond(startEpoch)), instantCol(Instant.ofEpochSecond(startEpoch + i)))
        }));

        actuals.push(actual[0].val.seconds());
        expecteds.push(i);
    }

    t.deepEqual(actuals, expecteds);
}));

test("between instants short time spans", t => withTestDatabase(async conn => {
    const startEpoch = 1490238000;
    const increment = 1;
    const actuals: number[] = [];
    const expecteds: number[] = [];
    for (let i = 0; i < 3600; i += increment) {
        const actual = await query("", conn, _q => ({
            val: durationBetween(instantCol(Instant.ofEpochSecond(startEpoch)), instantCol(Instant.ofEpochSecond(startEpoch + i)))
        }));

        actuals.push(actual[0].val.seconds());
        expecteds.push(i);
    }

    t.deepEqual(actuals, expecteds);
}));

test("between instants future short time spans", t => withTestDatabase(async conn => {
    const startEpoch = 1490238000;
    const increment = 1;
    const delta = 31877600;
    const actuals: number[] = [];
    const expecteds: number[] = [];
    for (let i = 0; i < 3600; i += increment) {
        const actual = await query("", conn, _q => ({
            val: durationBetween(instantCol(Instant.ofEpochSecond(startEpoch)), instantCol(Instant.ofEpochSecond(startEpoch + delta + i)))
        }));

        actuals.push(actual[0].val.seconds());
        expecteds.push(delta + i);
    }

    t.deepEqual(actuals, expecteds);
}));

test("between instants millis", t => withTestDatabase(async conn => {
    const startEpoch = 1490238000000;
    const increment = 1;
    const actuals: [number, number][] = [];
    const expecteds: [number, number][] = [];
    for (let i = 0; i < 10000; i += increment) {
        const actual = await query("", conn, _q => ({
            val: durationBetween(instantCol(Instant.ofEpochMilli(startEpoch)), instantCol(Instant.ofEpochMilli(startEpoch + i)))
        }));

        actuals.push([actual[0].val.seconds(), actual[0].val.nano()]);
        expecteds.push([Math.floor(i / 1000), i * 1000000 - Math.floor(i / 1000) * 1000000000]);
    }

    t.deepEqual(actuals, expecteds);
}));

test("negative between instants long time span", t => withTestDatabase(async conn => {
    const startEpoch = 1490238000;
    const increment = 12 * 60 * 60;
    const actuals: number[] = [];
    const expecteds: number[] = [];
    for (let i = 0; i < 63072000; i += increment) {
        const actual = await query("", conn, _q => ({
            val: durationBetween(instantCol(Instant.ofEpochSecond(startEpoch + i)), instantCol(Instant.ofEpochSecond(startEpoch)))
        }));

        actuals.push(actual[0].val.seconds());
        expecteds.push(-i);
    }

    t.deepEqual(actuals, expecteds);
}));

test("negative between instants short time spans", t => withTestDatabase(async conn => {
    const startEpoch = 1490238000;
    const increment = 1;
    const actuals: number[] = [];
    const expecteds: number[] = [];
    for (let i = 0; i < 3600; i += increment) {
        const actual = await query("", conn, _q => ({
            val: durationBetween(instantCol(Instant.ofEpochSecond(startEpoch + i)), instantCol(Instant.ofEpochSecond(startEpoch)))
        }));

        actuals.push(actual[0].val.seconds());
        expecteds.push(-i);
    }

    t.deepEqual(actuals, expecteds);
}));

test("negative between instants future short time spans", t => withTestDatabase(async conn => {
    const startEpoch = 1490238000;
    const increment = 1;
    const delta = 31877600;
    const actuals: number[] = [];
    const expecteds: number[] = [];
    for (let i = 0; i < 3600; i += increment) {
        const actual = await query("", conn, _q => ({
            val: durationBetween(instantCol(Instant.ofEpochSecond(startEpoch + delta + i)), instantCol(Instant.ofEpochSecond(startEpoch)))
        }));

        actuals.push(actual[0].val.seconds());
        expecteds.push(-(delta + i));
    }

    t.deepEqual(actuals, expecteds);
}));

test("negative between instants millis", t => withTestDatabase(async conn => {
    const startEpoch = 1490238000000;
    const increment = 1;
    const actuals: [number, number][] = [];
    const expecteds: [number, number][] = [];
    for (let i = 0; i < 10000; i += increment) {
        const actual = await query("", conn, _q => ({
            val: durationBetween(instantCol(Instant.ofEpochMilli(startEpoch + i)), instantCol(Instant.ofEpochMilli(startEpoch)))
        }));

        actuals.push([actual[0].val.seconds(), actual[0].val.nano()]);
        expecteds.push([Duration.ofMillis(-i).seconds(), Duration.ofMillis(-i).nano()]);
    }

    t.deepEqual(actuals, expecteds);
}));

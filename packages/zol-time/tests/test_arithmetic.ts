import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { Duration, Instant, LocalDate, LocalDateTime, LocalTime, Period } from "js-joda";
import { numberCol, query } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { durationBetween, durationCol, durationDivide, durationMinus, durationMultiply, durationPlus, expandTolocalDateTime, instantAdd, instantCol, instantSubtract, localDateAdd, localDateAddDays, localDateCol, localDateSubtract, localDateSubtractDays, localDateTimeAdd, localDateTimeCol, localDateTimeSubtract, localTimeAdd, localTimeCol, localTimeSubtract, periodCol, truncateToLocalDate } from "../src/zol-time";

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

test("instantAdd negative 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(-100)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490238000 - 100);
}));

test("instantAdd negative 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofDays(1).plusSeconds(1).negated()))
    }));

    t.equal(actual[0].val.epochSecond(), 1490238000 - (86400 + 1));
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

test("instantSubtract negative 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofSeconds(-100)))
    }));

    t.equal(actual[0].val.epochSecond(), 1490238000 + 100);
}));

test("instantSubtract negative 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: instantSubtract(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(Duration.ofDays(1).plusSeconds(1).negated()))
    }));

    t.equal(actual[0].val.epochSecond(), 1490238000 + (86400 + 1));
}));

test("durationPlus 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationPlus(durationCol(Duration.ofSeconds(100)), durationCol(Duration.ofSeconds(100)));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 100 + 100);
}));

test("durationPlus 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationPlus(durationCol(Duration.ofDays(1)), durationCol(Duration.ofSeconds(1)));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 86400 + 1);
}));

test("durationPlus 3", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationPlus(durationCol(Duration.ofDays(1)), durationCol(Duration.ofSeconds(1).negated()));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 86400 - 1);
}));

test("durationPlus 3", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationPlus(durationCol(Duration.ofDays(2)), durationCol(Duration.ofHours(2).negated()));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 2 * 86400 - 7200);
}));

test("durationMinus 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationMinus(durationCol(Duration.ofSeconds(100)), durationCol(Duration.ofSeconds(100)));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 100 - 100);
}));

test("durationMinus 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationMinus(durationCol(Duration.ofDays(1)), durationCol(Duration.ofSeconds(1)));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 86400 - 1);
}));

test("durationMinus 3", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationMinus(durationCol(Duration.ofDays(1)), durationCol(Duration.ofSeconds(1).negated()));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 86400 + 1);
}));

test("durationMinus 3", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationMinus(durationCol(Duration.ofDays(2)), durationCol(Duration.ofHours(2).negated()));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 2 * 86400 + 7200);
}));

test("durationMultiply", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        const duration = durationMultiply(durationCol(Duration.ofDays(2).plusSeconds(2)), numberCol(3));
        return {
            val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), duration)
        };
    });

    t.equal(actual[0].val.epochSecond(), 1490238000 + 3 * (2 * 86400 + 2));
}));

test("durationDivide", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => {
        return {
            val: durationDivide(durationCol(Duration.ofHours(1)), numberCol(1.5))
        };
    });

    t.equal(actual[0].val.toString(), "PT40M");
}));

test("duration sneaky 1", t => withTestDatabase(async conn => {
    const r = await query(conn, _q => ({
        val: durationBetween(instantCol(Instant.ofEpochSecond(1490140800)), instantCol(Instant.ofEpochSecond(1490227200)))
    }));

    const duration = r[0].val;

    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(duration))
    }));

    t.equal(actual[0].val.epochSecond(), 1490238000 + 86400);
}));

test("duration sneaky 2", t => withTestDatabase(async conn => {
    const r = await query(conn, _q => ({
        val: durationMinus(durationBetween(instantCol(Instant.ofEpochSecond(1490140800)), instantCol(Instant.ofEpochSecond(1490227200))), durationCol(Duration.ofHours(1)))
    }));

    const duration = r[0].val;

    const actual = await query(conn, _q => ({
        val: instantAdd(instantCol(Instant.ofEpochSecond(1490238000)), durationCol(duration))
    }));

    t.equal(actual[0].val.epochSecond(), 1490238000 + 82800);
}));

test("localDateTimeAdd 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateTimeAdd(localDateTimeCol(LocalDateTime.of(2017, 2, 20, 10, 0, 0)), durationCol(Duration.ofHours(3)))
    }));

    t.equal(actual[0].val.toString(), "2017-02-20T13:00");
}));

test("localDateTimeSubtract 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateTimeSubtract(localDateTimeCol(LocalDateTime.of(2017, 2, 20, 10, 0, 0)), durationCol(Duration.ofHours(3)))
    }));

    t.equal(actual[0].val.toString(), "2017-02-20T07:00");
}));

test("localDateTimeAdd 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateTimeAdd(localDateTimeCol(LocalDateTime.of(2017, 2, 20, 10, 0, 0)), periodCol(Period.of(0, 1, 0)))
    }));

    t.equal(actual[0].val.toString(), "2017-03-20T10:00");
}));

test("localDateTimeSubtract 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateTimeSubtract(localDateTimeCol(LocalDateTime.of(2017, 2, 20, 10, 0, 0)), periodCol(Period.of(0, 1, 0)))
    }));

    t.equal(actual[0].val.toString(), "2017-01-20T10:00");
}));

test("truncateToLocalDate", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: truncateToLocalDate(localDateTimeCol(LocalDateTime.of(2017, 2, 20, 10, 0, 0)))
    }));

    t.equal(actual[0].val.toString(), "2017-02-20");
}));

test("expandTolocalDateTime", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: expandTolocalDateTime(localDateCol(LocalDate.of(2017, 2, 20)))
    }));

    const expected: typeof actual = [{ val: LocalDateTime.of(2017, 2, 20, 0, 0, 0) }];

    t.deepEqual(actual, expected);
}));

test("localDateAddDays", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateAddDays(localDateCol(LocalDate.of(2017, 2, 20)), numberCol(20))
    }));

    t.equal(actual[0].val.toString(), "2017-03-12");
}));

test("localDateSubtractDays", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateSubtractDays(localDateCol(LocalDate.of(2017, 2, 20)), numberCol(20))
    }));

    t.equal(actual[0].val.toString(), "2017-01-31");
}));

test("localDateAdd 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateAdd(localDateCol(LocalDate.of(2017, 2, 20)), periodCol(Period.of(0, 1, 0)))
    }));

    t.equal(actual[0].val.toString(), "2017-03-20");
}));

test("localDateAdd 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateAdd(localDateCol(LocalDate.of(2017, 2, 20)), periodCol(Period.of(1, 0, 0)))
    }));

    t.equal(actual[0].val.toString(), "2018-02-20");
}));

test("localDateSubtract 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateSubtract(localDateCol(LocalDate.of(2017, 2, 20)), periodCol(Period.of(0, 1, 0)))
    }));

    t.equal(actual[0].val.toString(), "2017-01-20");
}));

test("localDateSubtract 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localDateSubtract(localDateCol(LocalDate.of(2017, 2, 20)), periodCol(Period.of(1, 0, 0)))
    }));

    t.equal(actual[0].val.toString(), "2016-02-20");
}));

test("localTimeAdd 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeAdd(localTimeCol(LocalTime.of(13, 30, 57)), durationCol(Duration.ofHours(6).plusSeconds(7)))
    }));

    t.equal(actual[0].val.toString(), "19:31:04");
}));

test("localTimeSubtract 1", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeSubtract(localTimeCol(LocalTime.of(13, 30, 57)), durationCol(Duration.ofHours(6).plusSeconds(7)))
    }));

    t.equal(actual[0].val.toString(), "07:30:50");
}));

test("localTimeAdd 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeAdd(localTimeCol(LocalTime.of(13, 30, 57)), durationCol(Duration.ofHours(20).plusSeconds(7)))
    }));

    t.equal(actual[0].val.toString(), "09:31:04");
}));

test("localTimeSubtract 2", t => withTestDatabase(async conn => {
    const actual = await query(conn, _q => ({
        val: localTimeSubtract(localTimeCol(LocalTime.of(13, 30, 57)), durationCol(Duration.ofHours(14).plusSeconds(7)))
    }));

    t.equal(actual[0].val.toString(), "23:30:50");
}));

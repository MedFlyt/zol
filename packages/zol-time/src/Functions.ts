import { Duration, Instant, LocalDateTime, Period } from "js-joda";
import { Col, e, unsafeCast, unsafeFun2 } from "zol";
import { durationParser, instantParser, localDateTimeParser } from "./Types";

export function instantToLocalDateTime<s>(instant: Col<s, Instant>, timezone: Col<s, string>): Col<s, LocalDateTime> {
    const asTimestamptz = unsafeCast(instant, "TIMESTAMPTZ", instantParser);
    return unsafeFun2("TIMEZONE", timezone, asTimestamptz, localDateTimeParser);
}

export function localDateTimeToInstant<s>(localDateTime: Col<s, LocalDateTime>, timezone: Col<s, string>): Col<s, Instant> {
    const asTimestamp = unsafeCast(localDateTime, "TIMESTAMP", localDateTimeParser);
    return unsafeFun2("TIMEZONE", timezone, asTimestamp, instantParser);
}

export function between<s>(startInclusive: Col<s, Instant>, endExclusive: Col<s, Instant>): Col<s, Duration> {
    const start = unsafeCast(startInclusive, "TIMESTAMPTZ", instantParser);
    const end = unsafeCast(endExclusive, "TIMESTAMPTZ", instantParser);
    return unsafeCast(e(<any>end, "-", <any>start), "INTERVAL", durationParser);
}

export function durationPlus<s>(lhs: Col<s, Duration>, rhs: Col<s, Duration>): Col<s, Duration> {
    return unsafeCast(e(<any>lhs, "+", <any>rhs), "INTERVAL", durationParser);
}

export function durationMinus<s>(lhs: Col<s, Duration>, rhs: Col<s, Duration>): Col<s, Duration> {
    return unsafeCast(e(<any>lhs, "-", <any>rhs), "INTERVAL", durationParser);
}

export function durationMultiply<s>(lhs: Col<s, Duration>, rhs: Col<s, number>): Col<s, Duration> {
    return unsafeCast(e(<any>rhs, "*", <any>lhs), "INTERVAL", durationParser);
}

export function instantAdd<s>(instant: Col<s, Instant>, duration: Col<s, Duration>): Col<s, Instant> {
    const lhs = unsafeCast(instant, "TIMESTAMPTZ", instantParser);
    const rhs = duration;
    return unsafeCast(e(<any>lhs, "+", <any>rhs), "TIMESTAMPTZ", instantParser);
}

export function instantSubtract<s>(instant: Col<s, Instant>, duration: Col<s, Duration>): Col<s, Instant> {
    const lhs = unsafeCast(instant, "TIMESTAMPTZ", instantParser);
    const rhs = duration;
    return unsafeCast(e(<any>lhs, "-", <any>rhs), "TIMESTAMPTZ", instantParser);
}

export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, duration: Col<s, Duration>): Col<s, LocalDateTime>;
export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, period: Col<s, Period>): Col<s, LocalDateTime>;

export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, t: Col<s, Duration> | Col<s, Period>): Col<s, LocalDateTime> {
    const lhs = unsafeCast(localDateTime, "TIMESTAMP", localDateTimeParser);
    const rhs = <any>t;
    return unsafeCast(e(<any>lhs, "+", <any>rhs), "TIMESTAMP", localDateTimeParser);
}

export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, duration: Col<s, Duration>): Col<s, LocalDateTime>;
export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, period: Col<s, Period>): Col<s, LocalDateTime>;

export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, t: Col<s, Duration> | Col<s, Period>): Col<s, LocalDateTime> {
    const lhs = unsafeCast(localDateTime, "TIMESTAMP", localDateTimeParser);
    const rhs = <any>t;
    return unsafeCast(e(<any>lhs, "-", <any>rhs), "TIMESTAMP", localDateTimeParser);
}

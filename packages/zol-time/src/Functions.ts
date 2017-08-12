import { Duration, Instant, LocalDate, LocalDateTime, LocalTime, Period } from "js-joda";
import { Col, e, SqlType, unsafeCast, unsafeFun2 } from "zol";
import { durationParser, instantParser, localDateParser, localDateTimeParser, localTimeParser } from "./Types";

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
    return unsafeCast(e(<any>lhs, "+", <any>duration), "TIMESTAMPTZ", instantParser);
}

export function instantSubtract<s>(instant: Col<s, Instant>, duration: Col<s, Duration>): Col<s, Instant> {
    const lhs = unsafeCast(instant, "TIMESTAMPTZ", instantParser);
    return unsafeCast(e(<any>lhs, "-", <any>duration), "TIMESTAMPTZ", instantParser);
}

export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, duration: Col<s, Duration>): Col<s, LocalDateTime>;
export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, period: Col<s, Period>): Col<s, LocalDateTime>;

export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, t: Col<s, Duration> | Col<s, Period>): Col<s, LocalDateTime> {
    const lhs = unsafeCast(localDateTime, "TIMESTAMP", localDateTimeParser);
    return unsafeCast(e(<any>lhs, "+", <any>t), "TIMESTAMP", localDateTimeParser);
}

export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, duration: Col<s, Duration>): Col<s, LocalDateTime>;
export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, period: Col<s, Period>): Col<s, LocalDateTime>;

export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, t: Col<s, Duration> | Col<s, Period>): Col<s, LocalDateTime> {
    const lhs = unsafeCast(localDateTime, "TIMESTAMP", localDateTimeParser);
    return unsafeCast(e(<any>lhs, "-", <any>t), "TIMESTAMP", localDateTimeParser);
}

export function truncateToLocalDate<s>(localDateTime: Col<s, LocalDateTime>): Col<s, LocalDate> {
    return unsafeCast(localDateTime, "DATE", localDateParser);
}

/**
 * The time will be set to "00:00:00"
 */
export function expandTolocalDateTime<s>(localDate: Col<s, LocalDate>): Col<s, LocalDateTime> {
    return unsafeCast(localDate, "TIMESTAMP", localDateTimeParser);
}

export function localDateAddDays<s>(localDate: Col<s, LocalDate>, days: Col<s, number>): Col<s, LocalDate> {
    const rhs = unsafeCast(days, "INT", SqlType.intParser);
    return unsafeCast(e(<any>localDate, "+", <any>rhs), "DATE", localDateParser);
}

export function localDateSubtractDays<s>(localDate: Col<s, LocalDate>, days: Col<s, number>): Col<s, LocalDate> {
    const rhs = unsafeCast(days, "INT", SqlType.intParser);
    return unsafeCast(e(<any>localDate, "-", <any>rhs), "DATE", localDateParser);
}

export function localDateAdd<s>(localDate: Col<s, LocalDate>, period: Col<s, Period>): Col<s, LocalDate> {
    return unsafeCast(e(<any>localDate, "+", <any>period), "DATE", localDateParser);
}

export function localDateSubtract<s>(localDate: Col<s, LocalDate>, period: Col<s, Period>): Col<s, LocalDate> {
    return unsafeCast(e(<any>localDate, "-", <any>period), "DATE", localDateParser);
}

export function localTimeAdd<s>(localTime: Col<s, LocalTime>, duration: Col<s, Duration>): Col<s, LocalTime> {
    return unsafeCast(e(<any>localTime, "+", <any>duration), "TIME", localTimeParser);
}

export function localTimeSubtract<s>(localTime: Col<s, LocalTime>, duration: Col<s, Duration>): Col<s, LocalTime> {
    return unsafeCast(e(<any>localTime, "-", <any>duration), "TIME", localTimeParser);
}

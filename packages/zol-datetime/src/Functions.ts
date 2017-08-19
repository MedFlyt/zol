import { Duration, Instant, LocalDate, LocalDateTime, LocalTime, Period } from "js-joda";
import { Col, e, SqlType, Unsafe } from "zol";
import { durationParser, instantParser, localDateParser, localDateTimeParser, localTimeParser, periodParser } from "./Types";

/**
 * When instant occurred, what time did the clocks on the wall located in timezone show?
 * (Or what do we predict them to show, if instant is in the future?)
 *
 * SQL equivilent: `TIMEZONE`
 */
export function instantToLocalDateTime<s>(instant: Col<s, Instant>, timezone: Col<s, string>): Col<s, LocalDateTime> {
    const asTimestamptz = Unsafe.unsafeCast(instant, "TIMESTAMPTZ", instantParser);
    return Unsafe.unsafeFun2("TIMEZONE", timezone, asTimestamptz, localDateTimeParser);
}

/**
 * When the clocks in timezone showed the given time, what was the instant?
 * (Or what do we predict it to be, if the clocks haven't yet showed this time)
 *
 * Note: If due to daylight savings time, the clocks in timezone showed the given
 * time on two seperate instances, then PostgreSQL sill arbitrarily pick one.
 * Similarly, if the clocks in timezone never showed the given time, then PostgreSQL
 * will pick an appropriately close instant.
 *
 * SQL equivilent: `TIMEZONE`
 */
export function localDateTimeToInstant<s>(localDateTime: Col<s, LocalDateTime>, timezone: Col<s, string>): Col<s, Instant> {
    const asTimestamp = Unsafe.unsafeCast(localDateTime, "TIMESTAMP", localDateTimeParser);
    return Unsafe.unsafeFun2("TIMEZONE", timezone, asTimestamp, instantParser);
}

/**
 * The duration between two Instants.
 *
 * SQL equivilent: `-`
 */
export function durationBetween<s>(startInclusive: Col<s, Instant>, endExclusive: Col<s, Instant>): Col<s, Duration> {
    const start = Unsafe.unsafeCast(startInclusive, "TIMESTAMPTZ", instantParser);
    const end = Unsafe.unsafeCast(endExclusive, "TIMESTAMPTZ", instantParser);
    return Unsafe.unsafeCast(e(<any>end, "-", <any>start), "INTERVAL", durationParser);
}

/**
 * SQL equivilent: `+`
 */
export function durationPlus<s>(lhs: Col<s, Duration>, rhs: Col<s, Duration>): Col<s, Duration> {
    return Unsafe.unsafeCast(e(<any>lhs, "+", <any>rhs), "INTERVAL", durationParser);
}

/**
 * SQL equivilent: `-`
 */
export function durationMinus<s>(lhs: Col<s, Duration>, rhs: Col<s, Duration>): Col<s, Duration> {
    return Unsafe.unsafeCast(e(<any>lhs, "-", <any>rhs), "INTERVAL", durationParser);
}

/**
 * SQL equivilent: `*`
 */
export function durationMultiply<s>(lhs: Col<s, Duration>, rhs: Col<s, number>): Col<s, Duration> {
    return Unsafe.unsafeCast(e(<any>rhs, "*", <any>lhs), "INTERVAL", durationParser);
}

/**
 * SQL equivilent: `/`
 */
export function durationDivide<s>(lhs: Col<s, Duration>, rhs: Col<s, number>): Col<s, Duration> {
    return Unsafe.unsafeCast(e(<any>lhs, "/", <any>rhs), "INTERVAL", durationParser);
}

/**
 * Add a Duration to an Instant
 *
 * SQL equivilent: `+`
 */
export function instantAdd<s>(instant: Col<s, Instant>, duration: Col<s, Duration>): Col<s, Instant> {
    const lhs = Unsafe.unsafeCast(instant, "TIMESTAMPTZ", instantParser);
    return Unsafe.unsafeCast(e(<any>lhs, "+", <any>duration), "TIMESTAMPTZ", instantParser);
}

/**
 * Subtract a Duration from an Instant
 *
 * SQL equivilent: `-`
 */
export function instantSubtract<s>(instant: Col<s, Instant>, duration: Col<s, Duration>): Col<s, Instant> {
    const lhs = Unsafe.unsafeCast(instant, "TIMESTAMPTZ", instantParser);
    return Unsafe.unsafeCast(e(<any>lhs, "-", <any>duration), "TIMESTAMPTZ", instantParser);
}

/**
 * Add a Duration to a LocalDateTime
 *
 * SQL equivilent: `+`
 */
export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, duration: Col<s, Duration>): Col<s, LocalDateTime>;

/**
 * Add a Period to a LocalDateTime.
 *
 * SQL equivilent: `+`
 */
export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, period: Col<s, Period>): Col<s, LocalDateTime>;

export function localDateTimeAdd<s>(localDateTime: Col<s, LocalDateTime>, t: Col<s, Duration> | Col<s, Period>): Col<s, LocalDateTime> {
    const lhs = Unsafe.unsafeCast(localDateTime, "TIMESTAMP", localDateTimeParser);
    return Unsafe.unsafeCast(e(<any>lhs, "+", <any>t), "TIMESTAMP", localDateTimeParser);
}

/**
 * Subtract a Duration from a LocalDateTime
 *
 * SQL equivilent: `-`
 */
export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, duration: Col<s, Duration>): Col<s, LocalDateTime>;

/**
 * Subtract a Period from a LocalDateTime
 *
 * SQL equivilent: `-`
 */
export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, period: Col<s, Period>): Col<s, LocalDateTime>;

export function localDateTimeSubtract<s>(localDateTime: Col<s, LocalDateTime>, t: Col<s, Duration> | Col<s, Period>): Col<s, LocalDateTime> {
    const lhs = Unsafe.unsafeCast(localDateTime, "TIMESTAMP", localDateTimeParser);
    return Unsafe.unsafeCast(e(<any>lhs, "-", <any>t), "TIMESTAMP", localDateTimeParser);
}

/**
 * Convert a LocalDateTime to a LocalDate (discarding the time portion)
 *
 * SQL equivilent: `CAST`
 */
export function truncateToLocalDate<s>(localDateTime: Col<s, LocalDateTime>): Col<s, LocalDate> {
    return Unsafe.unsafeCast(localDateTime, "DATE", localDateParser);
}

/**
 * Convert a LocalDate to a LocalDateTime. The time will be set to "00:00:00"
 *
 * SQL equivilent: `CAST`
 */
export function expandTolocalDateTime<s>(localDate: Col<s, LocalDate>): Col<s, LocalDateTime> {
    return Unsafe.unsafeCast(localDate, "TIMESTAMP", localDateTimeParser);
}

/**
 * Add n days to a LocalDate.
 *
 * This is similar to [[localDateAdd]], but can be more convenient when the
 * days you want to add is from some other column, or is a computed value.
 *
 * SQL equivilent: `+` (INTEGER)
 */
export function localDateAddDays<s>(localDate: Col<s, LocalDate>, days: Col<s, number>): Col<s, LocalDate> {
    const rhs = Unsafe.unsafeCast(days, "INT", SqlType.intParser);
    return Unsafe.unsafeCast(e(<any>localDate, "+", <any>rhs), "DATE", localDateParser);
}

/**
 * Subtract n days from a LocalDate.
 *
 * This is similar to [[localDateSubtract]], but can be more convenient when
 * the days you want to subtract is from some other column, or is a computed
 * value.
 *
 * SQL equivilent: `-` (INTEGER)
 */
export function localDateSubtractDays<s>(localDate: Col<s, LocalDate>, days: Col<s, number>): Col<s, LocalDate> {
    const rhs = Unsafe.unsafeCast(days, "INT", SqlType.intParser);
    return Unsafe.unsafeCast(e(<any>localDate, "-", <any>rhs), "DATE", localDateParser);
}

/**
 * Add a Period to a LocalDate
 *
 * SQL equivilent: `+`
 */
export function localDateAdd<s>(localDate: Col<s, LocalDate>, period: Col<s, Period>): Col<s, LocalDate> {
    return Unsafe.unsafeCast(e(<any>localDate, "+", <any>period), "DATE", localDateParser);
}

/**
 * Subtract a Period from a LocalDate
 *
 * SQL equivilent: `-`
 */
export function localDateSubtract<s>(localDate: Col<s, LocalDate>, period: Col<s, Period>): Col<s, LocalDate> {
    return Unsafe.unsafeCast(e(<any>localDate, "-", <any>period), "DATE", localDateParser);
}

/**
 * Add a Duration to a LocalTime. If the LocalTime overflows (goes past
 * midnight) then the result will wrap around.
 *
 * SQL equivilent: `+`
 */
export function localTimeAdd<s>(localTime: Col<s, LocalTime>, duration: Col<s, Duration>): Col<s, LocalTime> {
    return Unsafe.unsafeCast(e(<any>localTime, "+", <any>duration), "TIME", localTimeParser);
}

/**
 * Subtract a Duration from a LocalTime. If the LocalTime overflows (goes
 * before midnight) then the result will wrap around.
 *
 * SQL equivilent: `-`
 */
export function localTimeSubtract<s>(localTime: Col<s, LocalTime>, duration: Col<s, Duration>): Col<s, LocalTime> {
    return Unsafe.unsafeCast(e(<any>localTime, "-", <any>duration), "TIME", localTimeParser);
}

/**
 * The Period between two LocalDates.
 *
 * SQL equivilent: `age`
 */
export function periodBetween<s>(startDate: Col<s, LocalDate>, endDate: Col<s, LocalDate>): Col<s, Period> {
    return Unsafe.unsafeFun2("age", endDate, startDate, periodParser);
}

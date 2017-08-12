import { Duration, Instant, LocalDate, LocalDateTime, LocalTime, Period } from "js-joda";
import { Col, textCol, unsafeCast } from "zol";
import { intervalParser, parseLocalDate, parseLocalTime, parseZonedDateTime } from "./Parsers";

export function localDateTimeCol<s>(val: LocalDateTime): Col<s, LocalDateTime> {
    return unsafeCast(<any>textCol(val.toString()), "TIMESTAMP", localDateTimeParser);
}

export function localDateTimeParser(val: string): LocalDateTime {
    const t = parseZonedDateTime(val);
    return t.toLocalDateTime();
}

export function instantCol<s>(val: Instant): Col<s, Instant> {
    return unsafeCast(<any>textCol(val.toString()), "TIMESTAMPTZ", instantParser);
}

export function instantParser(val: string): Instant {
    const t = parseZonedDateTime(val);
    return t.toInstant();
}

export function localDateCol<s>(val: LocalDate): Col<s, LocalDate> {
    return unsafeCast(<any>textCol(val.toString()), "DATE", localDateParser);
}

export function localDateParser(val: string): LocalDate {
    return parseLocalDate(val);
}

export function localTimeCol<s>(val: LocalTime): Col<s, LocalTime> {
    return unsafeCast(<any>textCol(val.toString()), "TIME", localTimeParser);
}

export function localTimeParser(val: string): LocalTime {
    return parseLocalTime(val);
}

export function durationCol<s>(val: Duration): Col<s, Duration> {
    return unsafeCast(<any>textCol(val.toString()), "INTERVAL", durationParser);
}

/**
 * This should be used with great care, or ideally avoided
 */
export function durationParser(interval: string): Duration {
    const [years, months, days, hours, minutes, seconds, nanos] = intervalParser(interval);

    // PostgreSQL uses conversion factors 1 month = 30 days and 1 day = 24 hours.
    // It doesn't specify what a year is, but 365 feels right.
    // <https://www.postgresql.org/docs/current/static/datatype-datetime.html>
    return Duration.ofDays(years * 365 + months * 30 + days).plusHours(hours).plusMinutes(minutes).plusSeconds(seconds).plusNanos(nanos);
}

export function periodCol<s>(val: Period): Col<s, Period> {
    return unsafeCast(<any>textCol(val.toString()), "INTERVAL", periodParser);
}

/**
 * Warning: This is lossy. Only use if you really know what you doing
 */
export function periodParser(interval: string): Period {
    const [years, months, days] = intervalParser(interval);

    // hours, minutes, seconds, nanos: they get dropped! :(
    return Period.of(years, months, days);
}

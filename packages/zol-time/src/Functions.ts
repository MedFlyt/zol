import { Duration, Instant, LocalDateTime } from "js-joda";
import { Col, e, unsafeCast, unsafeFun2 } from "zol";
import { durationParser } from "./Parsers";
import { instantParser, localDateTimeParser } from "./Types";

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

import { Instant, LocalDateTime } from "js-joda";
import { Col, textCol } from "zol";
import { parseZonedDateTime } from "./Parsers";

export function localDateTimeCol<s>(val: LocalDateTime): Col<s, LocalDateTime> {
    return textCol(val.toString());
}

export function localDateTimeParser(val: string): LocalDateTime {
    const t = parseZonedDateTime(val);
    return t.toLocalDateTime();
}

export function instantCol<s>(val: Instant): Col<s, Instant> {
    return textCol(val.toString());
}

export function instantParser(val: string): Instant {
    const t = parseZonedDateTime(val);
    return t.toInstant();
}

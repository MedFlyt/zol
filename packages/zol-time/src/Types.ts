import { Instant } from "js-joda";
import { Col, textCol } from "zol";
import { parseZonedDateTime } from "./Parsers";

/*
export function localDateCol<s>(val: LocalDate): Col<s, LocalDate> {
    return textCol(val.
}

export namespace SqlDateTime {
    export function localDateParser(val: string): LocalDate {
        LocalDate.
    }
}
*/

export function instantCol<s>(val: Instant): Col<s, Instant> {
    return textCol(val.toString());
}

export function instantParser(val: string): Instant {
    const t = parseZonedDateTime(val);
    return t.toInstant();
}

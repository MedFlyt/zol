// Ported from <https://github.com/bendrucker/postgres-date>

import { LocalDate, LocalTime, ZonedDateTime, ZoneOffset } from "js-joda";

const DATE_TIME = /^(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/;
const DATE = /^(\d{1,})-(\d{2})-(\d{2})$/;
const TIME = /^(\d{2}):(\d{2}):(\d{2})(\.\d{1,})?$/;
const TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?$/;

export function parseZonedDateTime(isoDate: string): ZonedDateTime {
    const matches = DATE_TIME.exec(isoDate);

    if (matches === null) {
        throw new Error(`Error parsing date: ${isoDate}`);
    }

    const year = parseInt(matches[1], 10);

    const month = parseInt(matches[2], 10);
    const day = parseInt(matches[3], 10);
    const hour = parseInt(matches[4], 10);
    const minute = parseInt(matches[5], 10);
    const second = parseInt(matches[6], 10);

    const ss: string | undefined = <any>matches[7];
    const nanos = (ss !== undefined) ? Math.floor(1000000000 * parseFloat(ss)) : 0;

    const offset = timeZoneOffset(isoDate);
    if (offset !== null) {
        return ZonedDateTime.of(year, month, day, hour, minute, second, nanos, ZoneOffset.ofTotalSeconds(offset));
    } else {
        return ZonedDateTime.of(year, month, day, hour, minute, second, nanos, ZoneOffset.UTC);
    }
}

export function parseLocalDate(isoDate: string): LocalDate {
    const matches = DATE.exec(isoDate);

    if (matches === null) {
        throw new Error(`Error parsing date: ${isoDate}`);
    }

    const year = parseInt(matches[1], 10);
    const month = parseInt(matches[2], 10);
    const day = parseInt(matches[3], 10);

    return LocalDate.of(year, month, day);
}

export function parseLocalTime(isoTime: string): LocalTime {
    const matches = TIME.exec(isoTime);

    if (matches === null) {
        throw new Error(`Error parsing time: ${isoTime}`);
    }

    const hour = parseInt(matches[1], 10);
    const minute = parseInt(matches[2], 10);
    const second = parseInt(matches[3], 10);

    const ss: string | undefined = <any>matches[4];
    const nanos = (ss !== undefined) ? Math.floor(1000000000 * parseFloat(ss)) : 0;

    return LocalTime.of(hour, minute, second, nanos);
}

// match timezones:
// Z (UTC)
// -05
// +06:30
function timeZoneOffset(isoDate: string): number | null {
    const zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
    if (zone === null) {
        return null;
    }

    const type = zone[1];

    if (type === "Z") {
        return 0;
    }
    const sign = type === "-" ? -1 : 1;
    let offset = parseInt(zone[2], 10) * 3600;
    if (<any>zone[3] !== undefined) {
        offset += parseInt(zone[3], 10) * 60;
    }
    if (<any>zone[4] !== undefined) {
        offset += parseInt(zone[4], 10);
    }

    return offset * sign;
}

/**
 * years, months, days, hours, minutes, seconds, nanos
 */
export function intervalParser(interval: string): [number, number, number, number, number, number, number] {
    const parts = interval.split(" ");
    let years = 0;
    let months = 0;
    let days = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let nanos = 0;
    const numNamed = Math.floor(parts.length / 2);
    for (let i = 0; i < numNamed; ++i) {
        const v = parseInt(parts[i * 2], 10);
        const unit = parts[i * 2 + 1];
        if (unit.startsWith("year")) {
            years = v;
        } else if (unit.startsWith("mon")) {
            months = v;
        } else if (unit.startsWith("day")) {
            days = v;
        } else {
            throw new Error(`Unknown unit "${unit}" parsing interval "${interval}"`);
        }
    }
    if (parts.length % 2 === 1) {
        let time = parts[parts.length - 1];
        let negativeTime = false;
        if (time.charAt(0) === "-") {
            negativeTime = true;
            time = time.substring(1);
        } else if (time.charAt(0) === "+") {
            time = time.substring(1);
        }

        // This part looks exactly like a TIME
        const matches = TIME.exec(time);
        if (matches === null) {
            throw new Error(`Error parsing time component "${time}" parsing interval "${interval}"`);
        }

        hours = parseInt(matches[1], 10);
        minutes = parseInt(matches[2], 10);
        seconds = parseInt(matches[3], 10);

        const ss: string | undefined = <any>matches[4];
        nanos = (ss !== undefined) ? Math.floor(1000000000 * parseFloat(ss)) : 0;

        if (negativeTime) {
            hours = -hours;
            minutes = -minutes;
            seconds = -seconds;
            nanos = -nanos;
        }
    }

    return [years, months, days, hours, minutes, seconds, nanos];
}

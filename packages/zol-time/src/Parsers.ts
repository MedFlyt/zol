// Ported from <https://github.com/bendrucker/postgres-date>

import { Duration, LocalDate, LocalTime, ZonedDateTime, ZoneOffset } from "js-joda";

const DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/;
const DATE = /^(\d{1,})-(\d{2})-(\d{2})$/;
const TIME = /^(\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/;
const TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
const INTERVAL_DAYS = /^(\d{1,}) days?/;
const INTERVAL_WITH_DAYS = /^(\d{1,}) days? (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/;
const NEG_INTERVAL_WITH_DAYS = /^-(\d{1,}) days? -(\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/;

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

export function durationParser(interval: string): Duration {
    // -34 days -04:23:02
    {
        const matches = NEG_INTERVAL_WITH_DAYS.exec(interval);
        if (matches !== null) {
            const days = parseInt(matches[1], 10);
            const hours = parseInt(matches[2], 10);
            const minutes = parseInt(matches[3], 10);
            const seconds = parseInt(matches[4], 10);

            const ss: string | undefined = <any>matches[5];
            const nanos = (ss !== undefined) ? Math.floor(1000000000 * parseFloat(ss)) : 0;

            return Duration.ofDays(days).plusHours(hours).plusMinutes(minutes).plusSeconds(seconds).plusNanos(nanos).negated();
        }
    }

    const negative = interval.charAt(0) === "-";
    if (negative) {
        interval = interval.substring(1);
    }

    // 34 days 04:23:02
    {
        const matches = INTERVAL_WITH_DAYS.exec(interval);
        if (matches !== null) {
            const days = parseInt(matches[1], 10);
            const hours = parseInt(matches[2], 10);
            const minutes = parseInt(matches[3], 10);
            const seconds = parseInt(matches[4], 10);

            const ss: string | undefined = <any>matches[5];
            const nanos = (ss !== undefined) ? Math.floor(1000000000 * parseFloat(ss)) : 0;

            const res = Duration.ofDays(days).plusHours(hours).plusMinutes(minutes).plusSeconds(seconds).plusNanos(nanos);
            return negative ? res.negated() : res;
        }
    }

    // 04:23:02
    {
        // Interval with no days looks exactly like a TIME
        const matches = TIME.exec(interval);
        if (matches !== null) {
            const hours = parseInt(matches[1], 10);
            const minutes = parseInt(matches[2], 10);
            const seconds = parseInt(matches[3], 10);

            const ss: string | undefined = <any>matches[4];
            const nanos = (ss !== undefined) ? Math.floor(1000000000 * parseFloat(ss)) : 0;

            const res = Duration.ofHours(hours).plusMinutes(minutes).plusSeconds(seconds).plusNanos(nanos);
            return negative ? res.negated() : res;
        }
    }

    // 3 days
    {
        const matches = INTERVAL_DAYS.exec(interval);
        if (matches !== null) {
            const days = parseInt(matches[1], 10);

            const res = Duration.ofDays(days);
            return negative ? res.negated() : res;
        }
    }

    throw new Error(`Error parsing interval: ${interval}`);
}

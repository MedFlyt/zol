// Ported from <https://github.com/bendrucker/postgres-date>

import { LocalDate, ZonedDateTime, ZoneOffset } from "js-joda";

const DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/;
const DATE = /^(\d{1,})-(\d{2})-(\d{2})$/;
const TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;

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

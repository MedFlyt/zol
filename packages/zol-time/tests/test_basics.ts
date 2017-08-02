import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { Instant, LocalDateTime, ZonedDateTime, ZoneOffset } from "js-joda/dist/js-joda";
import { defaultValue, insertReturning, numberCol, pg, query, restrictEq, select, textCol } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { instantCol, localDateTimeCol, localDateTimeToInstant } from "../src/zol-time";
import { createMeetingTableSql, createPersonTableSql, meetingTable, MeetingTable, personTable, PersonTable } from "./Tables";

async function createPerson(conn: pg.Client, name: string): Promise<number> {
    const values: PersonTable = {
        id: defaultValue(),
        name: textCol(name)
    };

    const rets = await insertReturning(conn, personTable, values, row => ({ id: row.id }));
    return rets.id;
}

async function createMeeting(conn: pg.Client, subject: string, createdAt: Instant, createdBy: number, when: LocalDateTime, timezone: string): Promise<number> {
    const values: MeetingTable = {
        id: defaultValue(),
        subject: textCol(subject),
        createdAt: instantCol(createdAt),
        createdBy: numberCol(createdBy),
        scheduledAt: localDateTimeCol(when),
        timezone: textCol(timezone)
    };

    const rets = await insertReturning(conn, meetingTable, values, row => ({ id: row.id }));
    return rets.id;
}

test("instant simple", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);
    await pg.query_(conn, createMeetingTableSql);

    const linkId = await createPerson(conn, "Link");
    const meetingId = await createMeeting(conn, "Standup", Instant.ofEpochSecond(1501673200), linkId, LocalDateTime.of(2017, 08, 1, 10, 0), "America/New_York");

    const r1 = await query(conn, q => {
        const meeting = select(q, meetingTable);
        restrictEq(q, meeting.id, numberCol(meetingId));
        return meeting;
    });

    t.equal(r1.length, 1);
    t.equal(r1[0].createdAt.epochSecond(), 1501673200);
}));

test("local date time simple", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);
    await pg.query_(conn, createMeetingTableSql);

    const linkId = await createPerson(conn, "Link");
    const meetingId = await createMeeting(conn, "Standup", Instant.ofEpochSecond(1501673200), linkId, LocalDateTime.of(2017, 08, 1, 10, 0), "America/New_York");

    const r1 = await query(conn, q => {
        const meeting = select(q, meetingTable);
        restrictEq(q, meeting.id, numberCol(meetingId));
        return meeting;
    });

    t.equal(r1.length, 1);
    t.equal(r1[0].scheduledAt.toString(), "2017-08-01T10:00");
}));

test("convert local date time to instant", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);
    await pg.query_(conn, createMeetingTableSql);

    const linkId = await createPerson(conn, "Link");
    const meetingId = await createMeeting(conn, "Standup", Instant.ofEpochSecond(1501673200), linkId, LocalDateTime.of(2017, 08, 1, 10, 0), "America/New_York");

    const r1 = await query(conn, q => {
        const meeting = select(q, meetingTable);
        restrictEq(q, meeting.id, numberCol(meetingId));
        return {
            meetingInstant: localDateTimeToInstant(meeting.scheduledAt, meeting.timezone)
        };
    });

    t.equal(r1.length, 1);
    t.equal(ZonedDateTime.ofInstant(r1[0].meetingInstant, ZoneOffset.UTC).toString(), "2017-08-01T14:00Z");
}));

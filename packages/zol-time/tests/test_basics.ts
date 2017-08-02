import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { Instant } from "js-joda/dist/js-joda";
import { defaultValue, insertReturning, numberCol, pg, query, restrictEq, select, textCol } from "zol";
import { withTestDatabase } from "../../../helper_framework/TestDb";
import { instantCol } from "../src/zol-time";
import { createMeetingTableSql, createPersonTableSql, meetingTable, MeetingTable, personTable, PersonTable } from "./Tables";

async function createPerson(conn: pg.Client, name: string): Promise<number> {
    const values: PersonTable = {
        id: defaultValue(),
        name: textCol(name)
    };

    const rets = await insertReturning(conn, personTable, values, row => ({ id: row.id }));
    return rets.id;
}

async function createMeeting(conn: pg.Client, subject: string, createdAt: Instant, createdBy: number): Promise<number> {
    const values: MeetingTable = {
        id: defaultValue(),
        subject: textCol(subject),
        createdAt: instantCol(createdAt),
        createdBy: numberCol(createdBy)
    };

    const rets = await insertReturning(conn, meetingTable, values, row => ({ id: row.id }));
    return rets.id;
}
test("instant simple", t => withTestDatabase(async conn => {
    await pg.query_(conn, createPersonTableSql);
    await pg.query_(conn, createMeetingTableSql);

    const linkId = await createPerson(conn, "Link");
    const meetingId = await createMeeting(conn, "Standup", Instant.ofEpochSecond(1501673200), linkId);

    const r1 = await query(conn, q => {
        const meeting = select(q, meetingTable);
        restrictEq(q, meeting.id, numberCol(meetingId));
        return meeting;
    });

    t.equal(r1.length, 1);
    t.equal(r1[0].createdAt.epochSecond(), 1501673200);
}));

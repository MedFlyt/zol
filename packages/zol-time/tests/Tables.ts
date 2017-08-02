import { Instant, LocalDateTime } from "js-joda";
import { declareTable, MakeCols, MakeTable, SqlType } from "zol";
import { localDateTimeParser } from "../src/Types";
import { instantParser } from "../src/zol-time";

// --------------------------------------------------------------------

export const createPersonTableSql = `
    CREATE TABLE person (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
    );
`;

interface PersonReq {
    readonly name: string;
}

interface PersonDef {
    readonly id: number;
}

export type PersonCols<s> = MakeCols<s, PersonReq & PersonDef>;
export type PersonTable = MakeTable<PersonReq, PersonDef>;

export const personTable = declareTable<PersonReq, PersonDef>("person", {
    id: ["id", SqlType.numberParser],
    name: ["name", SqlType.stringParser]
});

// --------------------------------------------------------------------

export const createMeetingTableSql =
    `
    CREATE TABLE meeting (
        id SERIAL PRIMARY KEY,
        subject TEXT NOT NULL,
        created_by INT NOT NULL REFERENCES person (id),
        created_at TIMESTAMPTZ NOT NULL,
        scheduled_at TIMESTAMP NOT NULL,
        timezone TEXT NOT NULL
    )
    `;

export interface MeetingReq {
    readonly subject: string;
    readonly createdBy: number;
    readonly createdAt: Instant;
    readonly scheduledAt: LocalDateTime;
    readonly timezone: string;
}

export interface MeetingDef {
    readonly id: number;
}

export type MeetingCols<s> = MakeCols<s, MeetingReq & MeetingDef>;
export type MeetingTable = MakeTable<MeetingReq, MeetingDef>;

export const meetingTable = declareTable<MeetingReq, MeetingDef>("meeting", {
    id: ["id", SqlType.numberParser],
    subject: ["subject", SqlType.stringParser],
    createdBy: ["created_by", SqlType.numberParser],
    createdAt: ["created_at", instantParser],
    scheduledAt: ["scheduled_at", localDateTimeParser],
    timezone: ["timezone", SqlType.stringParser]
});

// --------------------------------------------------------------------

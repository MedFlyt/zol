export const createTablesSql: string =
    `
CREATE TABLE talent_agency (
    id SERIAL4 PRIMARY KEY,
    name TEXT NOT NULL,
    website TEXT
);

CREATE TABLE person (
    id SERIAL4 PRIMARY KEY,
    name TEXT
);

CREATE TABLE agent (
    id SERIAL4 PRIMARY KEY,
    person_id INT4 NOT NULL REFERENCES person (id),
    talent_agency_id INT4 NOT NULL REFERENCES talent_agency (id),
    email TEXT
);

CREATE TABLE performer (
    id SERIAL4 PRIMARY KEY,
    person_id INT4 NOT NULL REFERENCES person (id),
    sex TEXT NOT NULL,
    CHECK (sex IN ('MALE', 'FEMALE')),
    height INT
);

CREATE TABLE performer_photo (
    id SERIAL4 PRIMARY KEY,
    person_id INT4 NOT NULL REFERENCES person (id),
    paylod JSONB NOT NULL
);

CREATE TABLE performer_agency_contract (
    id SERIAL4 PRIMARY KEY,
    performer_id INT4 NOT NULL REFERENCES performer (id),
    talent_agency_id INT4 NOT NULL REFERENCES talent_agency (id),
    signed_at TEXT NOT NULL,
    terminated_at TIMESTAMPTZ,

    UNIQUE (performer_id, talent_agency_id)
);

CREATE TABLE singing_skill (
    id SERIAL4 PRIMARY KEY,
    performer_id INT4 NOT NULL REFERENCES performer (id) UNIQUE,
    voice_type TEXT NOT NULL,
    CHECK (voice_type IN ('SOPRANO', 'TENOR', 'BARITONE'))
);

CREATE TABLE comedy_skill (
    id SERIAL4 PRIMARY KEY,
    performer_id INT4 NOT NULL REFERENCES performer (id) UNIQUE,
    comedy_description TEXT NOT NULL
);

CREATE TABLE acting_skill (
    id SERIAL4 PRIMARY KEY,
    performer_id INT4 NOT NULL REFERENCES performer (id) UNIQUE,
    stunts BOOLEAN NOT NULL
);

CREATE TABLE audition (
    id SERIAL4 PRIMARY KEY,
    title TEXT NOT NULL,
    time TEXT NOT NULL,
    sex TEXT,
    CHECK (sex IN ('MALE', 'FEMALE'))
);

CREATE TABLE recommended_audition (
    id SERIAL4 PRIMARY KEY,
    audition_id INT4 NOT NULL REFERENCES audition (id),
    agent_id INT4 NOT NULL REFERENCES agent (id),

    UNIQUE (agent_id, audition_id)
);

CREATE TABLE audition_performance (
    id SERIAL4 PRIMARY KEY,
    audition_id INT4 NOT NULL REFERENCES audition (id),
    performer_id INT4 NOT NULL REFERENCES performer (id),
    referred_by_agent_id INT4 REFERENCES agent (id),
    auditioned_at TEXT NOT NULL,

    UNIQUE (performer_id, audition_id)
);

CREATE TABLE audition_outcome (
    id SERIAL4 PRIMARY KEY,
    audition_id INT4 NOT NULL REFERENCES audition (id) UNIQUE,
    winning_performance_id INT4 NOT NULL REFERENCES audition_performance (id),
    decided_at TEXT NOT NULL
);

CREATE TABLE status_update (
    id SERIAL4 PRIMARY KEY,
    person_id INT4 NOT NULL REFERENCES person (id),
    date TIMESTAMPTZ NOT NULL,
    payload JSONB NOT NULL
);
`;

import "../../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import * as test from "blue-tape";
import { withTestDatabase } from "../../../../helper_framework/TestDb";
import { defaultValue, insertManyReturning, nullCol, order, Order, pg, query, textCol } from "../../src/zol";
import { createTablesSql } from "./CreateTablesSql";
import { performerIdCol, talentAgencyIdCol } from "./EntityCol";
import { AgentId, PerformerId, TalentAgencyId } from "./EntityIds";
import { agentRecommendAudition, auditionAddPerformance, auditionSetWinner, createAgent, createAudition, createPerformer, performerAuditions, performerAuditionsWonOrUndecided, selectAgentFullView, talentAgencyAuditions, talentAgencySignPerformer } from "./Queries";
import { TalentAgencyTable, talentAgencyTable } from "./Tables";
import { Sex } from "./Types";

async function withAllTables<A>(action: (conn: pg.Client) => Promise<A>): Promise<A> {
    return withTestDatabase(async (conn: pg.Client) => {
        await pg.query_(conn, createTablesSql);

        return action(conn);
    });
}

interface TalentAgencies {
    venosis: TalentAgencyId;
    wayneEnterprises: TalentAgencyId;
}

interface Performers {
    abe: PerformerId;
    bernetta: PerformerId;
    colin: PerformerId;
    darlene: PerformerId;
    elvis: PerformerId;
}

interface Agents {
    valencia: AgentId;
    victor: AgentId;
    walton: AgentId;
    wanita: AgentId;
    wesley: AgentId;
}

interface Data {
    talentAgencies: TalentAgencies;
    performers: Performers;
    agents: Agents;
}

async function createTalentAgencies(conn: pg.Client): Promise<TalentAgencies> {
    const values: TalentAgencyTable[] = [
        {
            id: defaultValue(),
            name: textCol("Venosis"),
            website: nullCol()
        },
        {
            id: defaultValue(),
            name: textCol("Wayne Enterprises"),
            website: textCol("http://www.wayneenterprises.com")
        }
    ];

    const inserted = await insertManyReturning(conn,
        talentAgencyTable,
        values,
        row => {
            return {
                id: row.id
            };
        }
    );

    return {
        venosis: inserted[0].id,
        wayneEnterprises: inserted[1].id
    };
}

async function createAgents(conn: pg.Client, talentAgencies: TalentAgencies): Promise<Agents> {
    const victor = await createAgent(conn, talentAgencies.venosis, "Victor", null);
    const valencia = await createAgent(conn, talentAgencies.venosis, "Valencia", null);
    const walton = await createAgent(conn, talentAgencies.wayneEnterprises, "Walton", "walton@wayneenterprises.com");
    const wanita = await createAgent(conn, talentAgencies.wayneEnterprises, "Wanita", "wanita@wayneenterprises.com");
    const wesley = await createAgent(conn, talentAgencies.wayneEnterprises, "Wesley", "wesley@wayneenterprises.com");

    return {
        victor,
        valencia,
        walton,
        wanita,
        wesley
    };
}

async function createPerformers(conn: pg.Client): Promise<Performers> {
    const abe = await createPerformer(conn, "Abe", Sex.MALE, 180);
    const bernetta = await createPerformer(conn, "Bernetta", Sex.FEMALE, null);
    const colin = await createPerformer(conn, "Colin", Sex.MALE, 180);
    const darlene = await createPerformer(conn, "Darlene", Sex.FEMALE, 168);
    const elvis = await createPerformer(conn, "Elvis", Sex.MALE, 175);

    return {
        abe,
        bernetta,
        colin,
        darlene,
        elvis
    };
}

async function talentAgenciesSignPerformers(conn: pg.Client, talentAgencies: TalentAgencies, performers: Performers) {
    await talentAgencySignPerformer(conn, talentAgencies.venosis, performers.colin, new Date("2000-01-01T10:00:00.000Z"));
    await talentAgencySignPerformer(conn, talentAgencies.venosis, performers.abe, new Date("2000-01-02T11:00:00.000Z"));
    await talentAgencySignPerformer(conn, talentAgencies.venosis, performers.bernetta, new Date("2000-01-03T12:00:00.000Z"));
    await talentAgencySignPerformer(conn, talentAgencies.venosis, performers.darlene, new Date("2000-01-04T13:00:00.000Z"));

    await talentAgencySignPerformer(conn, talentAgencies.wayneEnterprises, performers.elvis, new Date("2000-01-02T14:00:00.000Z"));
    await talentAgencySignPerformer(conn, talentAgencies.wayneEnterprises, performers.darlene, new Date("2000-01-03T15:00:00.000Z"));
    await talentAgencySignPerformer(conn, talentAgencies.wayneEnterprises, performers.colin, new Date("2000-01-04T16:00:00.000Z"));
}

async function createAuditions(conn: pg.Client, performers: Performers, agents: Agents): Promise<void> {
    {
        const audition = await createAudition(conn, "Terminal Surrender", new Date("2000-02-05T15:30:00.000Z"), Sex.MALE);
        await agentRecommendAudition(conn, agents.valencia, audition);
        await agentRecommendAudition(conn, agents.victor, audition);
        await agentRecommendAudition(conn, agents.walton, audition);

        await auditionAddPerformance(conn, audition, performers.abe, new Date("2000-02-05T18:00:00.000Z"), agents.valencia);
        const colinWon = await auditionAddPerformance(conn, audition, performers.colin, new Date("2000-02-05T18:20:00.000Z"), null);
        await auditionAddPerformance(conn, audition, performers.elvis, new Date("2000-02-05T18:30:00.000Z"), null);
        await auditionSetWinner(conn, audition, colinWon, new Date("2000-02-06T12:00:00.000Z"));
    }
    {
        const audition = await createAudition(conn, "War for Humiliation", new Date("2000-02-08T15:30:00.000Z"), null);
        await agentRecommendAudition(conn, agents.valencia, audition);
        await auditionAddPerformance(conn, audition, performers.bernetta, new Date("2000-02-08T15:30:00.000Z"), agents.valencia);
        await auditionAddPerformance(conn, audition, performers.elvis, new Date("2000-02-08T15:40:00.000Z"), null);
    }
    {
        const audition = await createAudition(conn, "Infinite Jeopardy", new Date("2000-02-12T09:00:00.000Z"), Sex.MALE);
        await agentRecommendAudition(conn, agents.wanita, audition);
        await agentRecommendAudition(conn, agents.wesley, audition);
        await auditionAddPerformance(conn, audition, performers.colin, new Date("2000-02-12T09:05:00.000Z"), null);
        await auditionAddPerformance(conn, audition, performers.elvis, new Date("2000-02-12T09:20:00.000Z"), agents.wesley);
    }
    {
        const audition = await createAudition(conn, "Instant Payback", new Date("2000-02-25T15:30:00.000Z"), null);
        await agentRecommendAudition(conn, agents.valencia, audition);
        await agentRecommendAudition(conn, agents.victor, audition);
        await agentRecommendAudition(conn, agents.walton, audition);
        await agentRecommendAudition(conn, agents.wanita, audition);
        await agentRecommendAudition(conn, agents.wesley, audition);
        await auditionAddPerformance(conn, audition, performers.abe, new Date("2000-02-25T15:30:00.000Z"), null);
        await auditionAddPerformance(conn, audition, performers.bernetta, new Date("2000-02-25T15:40:00.000Z"), null);
        await auditionAddPerformance(conn, audition, performers.colin, new Date("2000-02-25T15:50:00.000Z"), agents.victor);
        const darleneWon = await auditionAddPerformance(conn, audition, performers.darlene, new Date("2000-02-25T16:00:00.000Z"), agents.valencia);
        await auditionAddPerformance(conn, audition, performers.elvis, new Date("2000-02-25T16:10:00.000Z"), agents.wanita);
        await auditionSetWinner(conn, audition, darleneWon, new Date("2000-02-26T12:00:00.000Z"));
    }
    {
        const audition = await createAudition(conn, "Sudden Retaliation", new Date("2000-02-25T15:40:00.000Z"), Sex.FEMALE);
        await agentRecommendAudition(conn, agents.wesley, audition);
        await auditionAddPerformance(conn, audition, performers.bernetta, new Date("2000-02-25T16:00:00.000Z"), null);
        const darleneWon = await auditionAddPerformance(conn, audition, performers.darlene, new Date("2000-02-25T16:30:00.000Z"), agents.wesley);
        await auditionSetWinner(conn, audition, darleneWon, new Date("2000-02-02T12:00:00.000Z"));
    }
    {
        const audition = await createAudition(conn, "Welcoming Dearest Johnathan", new Date("2000-03-15T11:20:00.000Z"), null);
        await agentRecommendAudition(conn, agents.wanita, audition);
    }
    {
        await createAudition(conn, "Master of Trouble", new Date("2000-03-16T10:00:00.000Z"), Sex.FEMALE);
    }
}

async function insertInitialData(conn: pg.Client): Promise<Data> {
    const talentAgencies = await createTalentAgencies(conn);
    const agents = await createAgents(conn, talentAgencies);
    const performers = await createPerformers(conn);
    await talentAgenciesSignPerformers(conn, talentAgencies, performers);
    await createAuditions(conn, performers, agents);

    return {
        talentAgencies,
        agents,
        performers
    };
}

test("create tables", t => withAllTables(async _conn => {
    t.equal(1, 1);
}));

test("insert initial data", _t => withAllTables(async conn => {
    await insertInitialData(conn);
}));

test("selectAgentFullView", t => withAllTables(async conn => {
    const { agents, talentAgencies } = await insertInitialData(conn);

    const actual = await query(conn, q => selectAgentFullView(q));

    const expected: typeof actual = [
        {
            email: null,
            id: agents.valencia,
            name: "Valencia",
            numRecommendedAuditions: 3,
            personId: actual[0].personId,
            talentAgencyId: talentAgencies.venosis
        },
        {
            email: null,
            id: agents.victor,
            name: "Victor",
            numRecommendedAuditions: 2,
            personId: actual[1].personId,
            talentAgencyId: talentAgencies.venosis
        },
        {
            email: "walton@wayneenterprises.com",
            id: agents.walton,
            name: "Walton",
            numRecommendedAuditions: 2,
            personId: actual[2].personId,
            talentAgencyId: talentAgencies.wayneEnterprises
        },
        {
            email: "wanita@wayneenterprises.com",
            id: agents.wanita,
            name: "Wanita",
            numRecommendedAuditions: 3,
            personId: actual[3].personId,
            talentAgencyId: talentAgencies.wayneEnterprises
        },
        {
            email: "wesley@wayneenterprises.com",
            id: agents.wesley,
            name: "Wesley",
            numRecommendedAuditions: 3,
            personId: actual[4].personId,
            talentAgencyId: talentAgencies.wayneEnterprises
        }
    ];

    t.deepEqual(actual, expected);
}));

test("performer auditions", t => withAllTables(async conn => {
    const { performers } = await insertInitialData(conn);
    async function performances(performerId: PerformerId) {
        const ps = await query(conn, q => {
            const auditions = performerAuditions(q, performerIdCol(performerId));
            order(q, auditions.title, Order.Asc);
            return {
                title: auditions.title
            };
        });
        return ps.map(p => p.title);
    }

    const actual = [
        await performances(performers.abe),
        await performances(performers.bernetta),
        await performances(performers.colin),
        await performances(performers.darlene),
        await performances(performers.elvis)
    ];

    const expected: typeof actual = [
        ["Instant Payback", "Terminal Surrender"],
        ["Instant Payback", "Sudden Retaliation", "War for Humiliation"],
        ["Infinite Jeopardy", "Instant Payback", "Terminal Surrender"],
        ["Instant Payback", "Sudden Retaliation"],
        ["Infinite Jeopardy", "Instant Payback", "Terminal Surrender", "War for Humiliation"]
    ];

    t.deepEqual(actual, expected);
}));

test.skip("performances won or undecided", t => withAllTables(async conn => {
    const { agents, performers } = await insertInitialData(conn);

    const actual = [
        await query(conn, q => performerAuditionsWonOrUndecided(q, performerIdCol(performers.abe))),
        await query(conn, q => performerAuditionsWonOrUndecided(q, performerIdCol(performers.bernetta))),
        await query(conn, q => performerAuditionsWonOrUndecided(q, performerIdCol(performers.colin))),
        await query(conn, q => performerAuditionsWonOrUndecided(q, performerIdCol(performers.darlene))),
        await query(conn, q => performerAuditionsWonOrUndecided(q, performerIdCol(performers.elvis)))
    ];

    const expected: typeof actual = [
        [],
        [
            {
                hasWinningPerformance: false,
                id: actual[1][0].id,
                sex: null,
                time: new Date("2000-02-08T15:30:00.000Z"),
                title: "War for Humiliation",
                winningPerformanceAuditionedAt: null,
                winningPerformanceDecidedAt: null,
                winningPerformancePerformerId: null,
                winningPerformanceReferredByAgentId: null
            }
        ],
        [
            {
                hasWinningPerformance: true,
                id: actual[2][0].id,
                sex: Sex.MALE,
                time: new Date("2000-02-05T15:30:00.000Z"),
                title: "Terminal Surrender",
                winningPerformanceAuditionedAt: new Date("2000-02-05T18:20:00.000Z"),
                winningPerformanceDecidedAt: new Date("2000-02-06T12:00:00.000Z"),
                winningPerformancePerformerId: performers.colin,
                winningPerformanceReferredByAgentId: null
            },
            {
                hasWinningPerformance: false,
                id: actual[2][1].id,
                sex: Sex.MALE,
                time: new Date("2000-02-12T09:00:00.000Z"),
                title: "Infinite Jeopardy",
                winningPerformanceAuditionedAt: null,
                winningPerformanceDecidedAt: null,
                winningPerformancePerformerId: null,
                winningPerformanceReferredByAgentId: null
            }
        ],
        [
            {
                hasWinningPerformance: true,
                id: actual[3][0].id,
                sex: null,
                time: new Date("2000-02-25T15:30:00.000Z"),
                title: "Instant Payback",
                winningPerformanceAuditionedAt: new Date("2000-02-25T16:00:00.000Z"),
                winningPerformanceDecidedAt: new Date("2000-02-26T12:00:00.000Z"),
                winningPerformancePerformerId: performers.darlene,
                winningPerformanceReferredByAgentId: agents.valencia
            },
            {
                hasWinningPerformance: true,
                id: actual[3][1].id,
                sex: Sex.FEMALE,
                time: new Date("2000-02-25T15:40:00.000Z"),
                title: "Sudden Retaliation",
                winningPerformanceAuditionedAt: new Date("2000-02-25T16:30:00.000Z"),
                winningPerformanceDecidedAt: new Date("2000-02-02T12:00:00.000Z"),
                winningPerformancePerformerId: performers.darlene,
                winningPerformanceReferredByAgentId: agents.wesley
            }
        ],
        [
            {
                hasWinningPerformance: false,
                id: actual[4][0].id,
                sex: null,
                time: new Date("2000-02-08T15:30:00.000Z"),
                title: "War for Humiliation",
                winningPerformanceAuditionedAt: null,
                winningPerformanceDecidedAt: null,
                winningPerformancePerformerId: null,
                winningPerformanceReferredByAgentId: null
            },
            {
                hasWinningPerformance: false,
                id: actual[2][1].id,
                sex: Sex.MALE,
                time: new Date("2000-02-12T09:00:00.000Z"),
                title: "Infinite Jeopardy",
                winningPerformanceAuditionedAt: null,
                winningPerformanceDecidedAt: null,
                winningPerformancePerformerId: null,
                winningPerformanceReferredByAgentId: null
            }

        ]
    ];
    t.deepEqual(actual, expected);
}));

test("talent agency auditions", t => withAllTables(async conn => {
    const { talentAgencies } = await insertInitialData(conn);

    const actual = await query(conn, q => {
        const a = talentAgencyAuditions(q, talentAgencyIdCol(talentAgencies.venosis));
        order(q, a.title, Order.Asc);
        return {
            title: a.title
        };
    });

    const expected: typeof actual = [
        { title: "Instant Payback" },
        { title: "Terminal Surrender" },
        { title: "War for Humiliation" }
    ];

    t.deepEqual(actual, expected);
}));

// test("talent agency auditions 2", t => withAllTables(async conn => {
//     const { performers } = await insertInitialData(conn);

//     const statusUpdateId = await createPerformerStatusUpdate(conn, performers.abe, new Date("2000-05-01T09:00:00.000Z"), "Title", "Body");

//     const actual = await query(conn, q => getAllStatusUpdates(q, performerIdCol(performers.abe)));

//     const expected: typeof actual = [
//         {
//             id: statusUpdateId,
//             date: new Date("2000-05-01T09:00:00.000Z"),
//             personId: actual[0].personId,
//             payload: PGJson.parse({
//                 title: "Title",
//                 body: "Body"
//             }),
//             title: "Title",
//             body: "Body"
//         }
//     ];

//     t.deepEqual(actual, expected);
// }));

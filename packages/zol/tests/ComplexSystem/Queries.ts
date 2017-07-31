import { aggregate, Col, count, dateCol, defaultValue, e, groupBy, inQuery, insertReturning, isNotNull, jsonCol, leftJoin, not, nullCol, numberCol, Order, order, pg, PGJson, Q, query, restrict, restrictEq, select, textCol, update } from "../../src/zol";
import { agentIdCol, auditionIdCol, auditionPerformanceIdCol, performerIdCol, personIdCol, talentAgencyIdCol } from "./EntityCol";
import { AgentId, AuditionId, AuditionPerformanceId, PerformerId, PersonId, TalentAgencyId } from "./EntityIds";
import { AgentTable, agentTable, auditionOutcomeTable, AuditionOutcomeTable, auditionPerformanceTable, AuditionPerformanceTable, auditionTable, AuditionTable, performerAgencyContractTable, PerformerAgencyContractTable, PerformerTable, performerTable, personTable, PersonTable, recommendedAuditionTable, RecommendedAuditionTable, singingSkillTable, statusUpdateTable, StatusUpdateTable } from "./Tables";
import { Sex, sexCol } from "./Types";

export async function createPerson(conn: pg.Client, name: string): Promise<PersonId> {
    const values: PersonTable = {
        id: defaultValue(),
        name: textCol(name)
    };

    const inserted = await insertReturning(conn,
        personTable,
        values,
        row => ({ id: row.id }));

    return inserted.id;
}

export async function createAgent(conn: pg.Client, talentAgencyId: TalentAgencyId, name: string, email: string | null): Promise<AgentId> {
    const personId = await createPerson(conn, name);

    const values: AgentTable = {
        id: defaultValue(),
        personId: personIdCol(personId),
        talentAgencyId: talentAgencyIdCol(talentAgencyId),
        email: email !== null ? textCol(email) : nullCol()
    };

    const inserted = await insertReturning(conn,
        agentTable,
        values,
        row => ({ id: row.id })
    );

    return inserted.id;
}

export async function createPerformer(conn: pg.Client, name: string, sex: Sex, height: number | null): Promise<PerformerId> {
    const personId = await createPerson(conn, name);

    const values: PerformerTable = {
        id: defaultValue(),
        personId: personIdCol(personId),
        sex: sexCol(sex),
        height: height !== null ? numberCol(height) : nullCol()
    };

    const inserted = await insertReturning(conn,
        performerTable,
        values,
        row => ({ id: row.id })
    );

    return inserted.id;
}

export async function talentAgencySignPerformer(conn: pg.Client, talentAgencyId: TalentAgencyId, performerId: PerformerId, signedAt: Date): Promise<void> {
    const values: PerformerAgencyContractTable = {
        id: defaultValue(),
        talentAgencyId: talentAgencyIdCol(talentAgencyId),
        performerId: performerIdCol(performerId),
        signedAt: dateCol(signedAt),
        terminatedAt: nullCol()
    };

    await insertReturning(conn,
        performerAgencyContractTable,
        values,
        row => ({ id: row.id })
    );
}

export async function talentAgencyTerminatePerformer(conn: pg.Client, talentAgencyId: TalentAgencyId, performerId: PerformerId, terminatedAt: Date): Promise<void> {
    await update(conn,
        performerAgencyContractTable,
        contract => e(
            e(contract.performerId, "=", performerIdCol(performerId)),
            "AND", e(contract.talentAgencyId, "=", talentAgencyIdCol(talentAgencyId))),
        contract => {
            const result: PerformerAgencyContractTable = {
                ...contract,
                terminatedAt: dateCol(terminatedAt)
            };
            return result;
        }
    );
}

export async function createAudition(conn: pg.Client, title: string, time: Date, sex: Sex | null): Promise<AuditionId> {
    const values: AuditionTable = {
        id: defaultValue(),
        title: textCol(title),
        time: dateCol(time),
        sex: sex !== null ? sexCol(sex) : nullCol()
    };

    const inserted = await insertReturning(conn,
        auditionTable,
        values,
        row => ({ id: row.id })
    );

    return inserted.id;
}

export async function agentRecommendAudition(conn: pg.Client, agentId: AgentId, auditionId: AuditionId): Promise<void> {
    const values: RecommendedAuditionTable = {
        id: defaultValue(),
        agentId: agentIdCol(agentId),
        auditionId: auditionIdCol(auditionId)
    };

    await insertReturning(conn,
        recommendedAuditionTable,
        values,
        row => ({ id: row.id })
    );
}

export async function auditionAddPerformance(conn: pg.Client, auditionId: AuditionId, performerId: PerformerId, auditionedAt: Date, referredByAgentId: AgentId | null): Promise<AuditionPerformanceId> {
    const values: AuditionPerformanceTable = {
        id: defaultValue(),
        auditionId: auditionIdCol(auditionId),
        performerId: performerIdCol(performerId),
        auditionedAt: dateCol(auditionedAt),
        referredByAgentId: referredByAgentId !== null ? agentIdCol(referredByAgentId) : nullCol()
    };

    const inserted = await insertReturning(conn,
        auditionPerformanceTable,
        values,
        row => ({ id: row.id })
    );

    return inserted.id;
}

export async function auditionSetWinner(conn: pg.Client, auditionId: AuditionId, winningPerformanceId: AuditionPerformanceId, decidedAt: Date): Promise<void> {
    const values: AuditionOutcomeTable = {
        id: defaultValue(),
        auditionId: auditionIdCol(auditionId),
        winningPerformanceId: auditionPerformanceIdCol(winningPerformanceId),
        decidedAt: dateCol(decidedAt)
    };

    await insertReturning(conn,
        auditionOutcomeTable,
        values,
        row => ({ id: row.id })
    );
}


export function selectPerformerFullView<s>(q: Q<s>) {
    const performer = select(q, performerTable);
    const person = select(q, personTable);
    restrictEq(q, performer.personId, person.id);
    const singingSkill = leftJoin(q,
        q => select(q, singingSkillTable),
        singingSKill => e(singingSKill.performerId, "=", performer.id));
    return {
        ...person,
        ...singingSkill,
        ...performer,
        singingSkillId: singingSkill.id
    };
}

export function selectAgentFullView<s>(q: Q<s>) {
    const agent = select(q, agentTable);
    const person = select(q, personTable);
    restrictEq(q, agent.personId, person.id);
    const aggr = aggregate(q, q => {
        const r = select(q, recommendedAuditionTable);
        const agent2 = groupBy(q, r.agentId);
        return {
            numRecommendedAuditions: count(r.auditionId),
            agentId: agent2
        };
    });
    restrictEq(q, aggr.agentId, agent.id);
    order(q, person.name, Order.Asc);
    return {
        ...agent,
        name: person.name,
        numRecommendedAuditions: aggr.numRecommendedAuditions
    };
}

export function singlePerformer<s>(q: Q<s>, performerId: Col<s, PerformerId>) /*: PerformerDetails<s>*/ {
    const performerFull = selectPerformerFullView(q);
    restrictEq(q, performerFull.id, performerId);
    return performerFull;
}

export function auditionAllPerformers<s>(q: Q<s>, auditionId: Col<s, AuditionId>) {
    const audition = select(q, auditionTable);
    const auditionPerformance = select(q, auditionPerformanceTable);
    const performer = selectPerformerFullView(q);
    restrictEq(q, performer.id, auditionPerformance.performerId);
    restrictEq(q, audition.id, auditionId);
    restrictEq(q, auditionPerformance.auditionId, audition.id);
    return performer;
}

export function auditionAllPerformerNames<s>(q: Q<s>, auditionId: Col<s, AuditionId>): { name: Col<s, string> } {
    const col = auditionAllPerformers(q, auditionId);
    return {
        name: col.name
    };
}

export function performerAuditions<s>(q: Q<s>, performerId: Col<s, PerformerId>) {
    const auditionPerformance = select(q, auditionPerformanceTable);
    restrictEq(q, auditionPerformance.performerId, performerId);
    const auditionFull = selectAuditionFullView(q);
    restrictEq(q, auditionFull.id, auditionPerformance.auditionId);
    return auditionFull;
}

export function performerAuditionsWonOrUndecided<s>(q: Q<s>, performerId: Col<s, PerformerId>) {
    const audition = performerAuditions(q, performerId);
    restrict(q,
        e(e(audition.winningPerformancePerformerId, "=", performerId),
            "OR", not(audition.hasWinningPerformance)));
    return audition;
}

export function selectAuditionFullView<s>(q: Q<s>) {
    const audition = select(q, auditionTable);
    order(q, audition.time, Order.Asc);
    const outcome = leftJoin(q,
        q => select(q, auditionOutcomeTable),
        auditionOutcome => e(auditionOutcome.auditionId, "=", audition.id)
    );
    const winningPerformance = leftJoin(q,
        q => select(q, auditionPerformanceTable),
        performance => e(performance.id, "=", outcome.winningPerformanceId)
    );
    return {
        ...audition,
        hasWinningPerformance: isNotNull(outcome.id),
        winningPerformanceDecidedAt: outcome.decidedAt,
        winningPerformancePerformerId: winningPerformance.performerId,
        winningPerformanceAuditionedAt: winningPerformance.auditionedAt,
        winningPerformanceReferredByAgentId: winningPerformance.referredByAgentId
    };
}

export function selectTalentAgencyAgents<s>(q: Q<s>, talentAgencyId: Col<s, TalentAgencyId>) {
    const agent = select(q, agentTable);
    restrictEq(q, agent.talentAgencyId, talentAgencyId);
    return agent;
}

export function talentAgencyAuditions<s>(q: Q<s>, talentAgencyId: Col<s, TalentAgencyId>) {
    const audition = selectAuditionFullView(q);
    restrict(q, inQuery(audition.id, q => {
        const agent = selectTalentAgencyAgents(q, talentAgencyId);
        const recommendedAudition = select(q, recommendedAuditionTable);
        restrictEq(q, recommendedAudition.agentId, agent.id);
        return recommendedAudition.auditionId;
    }));
    return audition;
}

export function selectStatusUpdateWithPerson<s>(q: Q<s>) {
    const status = select(q, statusUpdateTable);
    const performer = leftJoin(q,
        q => select(q, performerTable),
        performer => e(performer.personId, "=", status.personId)
    );
    const agent = leftJoin(q,
        q => select(q, agentTable),
        agent => e(agent.personId, "=", status.personId)
    );
    return {
        ...status,
        performerId: performer.id,
        agentId: agent.id
    };
}

export async function createPerformerStatusUpdate(conn: pg.Client, performerId: PerformerId, date: Date, title: string, body: string) {
    const results = await query(conn, q => {
        const performer = select(q, performerTable);
        restrictEq(q, performer.id, performerIdCol(performerId));
        return {
            personId: performer.personId
        };
    });

    if (results.length !== 1) {
        throw new Error("Expected 1 row but got: " + results.length);
    }

    return createStatusUpdate(conn, results[0].personId, date, title, body);
}

export async function createStatusUpdate(conn: pg.Client, personId: PersonId, date: Date, title: string, body: string) {
    const values: StatusUpdateTable = {
        id: defaultValue(),
        personId: personIdCol(personId),
        date: dateCol(date),
        payload: jsonCol({
            title: title,
            body: body
        })
    };

    const inserted = await insertReturning(conn,
        statusUpdateTable,
        values,
        row => ({ id: row.id }));

    return inserted.id;
}

export function getAllStatusUpdates<s>(q: Q<s>, performerId: Col<s, PerformerId>) {
    const status = select(q, statusUpdateTable);
    const performer = select(q, performerTable);
    restrictEq(q, performer.id, performerId);
    restrictEq(q, status.personId, performer.personId);
    return {
        ...status,
        title: PGJson.objFieldAsText(status.payload, textCol("title")),
        body: PGJson.objFieldAsText(status.payload, textCol("body"))
    };
}

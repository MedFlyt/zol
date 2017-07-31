import { Col, numberCol } from "../../src/zol";
import { AgentId, AuditionId, AuditionPerformanceId, PerformerId, PersonId, TalentAgencyId } from "./EntityIds";

export function personIdCol<s>(val: PersonId): Col<s, PersonId> {
    return <any>numberCol(PersonId.unwrap(val));
}

export function talentAgencyIdCol<s>(val: TalentAgencyId): Col<s, TalentAgencyId> {
    return <any>numberCol(TalentAgencyId.unwrap(val));
}

export function agentIdCol<s>(val: AgentId): Col<s, AgentId> {
    return <any>numberCol(AgentId.unwrap(val));
}

export function performerIdCol<s>(val: PerformerId): Col<s, PerformerId> {
    return <any>numberCol(PerformerId.unwrap(val));
}

export function auditionIdCol<s>(val: AuditionId): Col<s, AuditionId> {
    return <any>numberCol(AuditionId.unwrap(val));
}

export function auditionPerformanceIdCol<s>(val: AuditionPerformanceId): Col<s, AuditionPerformanceId> {
    return <any>numberCol(AuditionPerformanceId.unwrap(val));
}

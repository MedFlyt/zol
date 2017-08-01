import { declareTable, MakeCols, MakeTable, SqlType } from "../../src/zol";
import { ActingSkillId, AgentId, AuditionId, AuditionOutcomeId, AuditionPerformanceId, ComedySkillId, PerformerAgencyContractId, PerformerId, PerformerPhotoId, PersonId, RecommendedAuditionId, SingingSkillId, StatusUpdateId, TalentAgencyId } from "./EntityIds";
import { Sex, VoiceType } from "./Types";

// --------------------------------------------------------------------

interface TalentAgencyReq {
    readonly name: string;
    readonly website: string | null;
}

interface TalentAgencyDef {
    readonly id: TalentAgencyId;
}

export type TalentAgencyCols<s> = MakeCols<s, TalentAgencyReq & TalentAgencyDef>;
export type TalentAgencyTable = MakeTable<TalentAgencyReq, TalentAgencyDef>;

export const talentAgencyTable = declareTable<TalentAgencyReq, TalentAgencyDef>("talent_agency", [
    ["id", "id", SqlType.numberParser],
    ["name", "name", SqlType.stringParser],
    ["website", "website", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface PersonReq {
    readonly name: string;
}

interface PersonDef {
    readonly id: PersonId;
}

export type PersonCols<s> = MakeCols<s, PersonReq & PersonDef>;
export type PersonTable = MakeTable<PersonReq, PersonDef>;

export const personTable = declareTable<PersonReq, PersonDef>("person", [
    ["id", "id", SqlType.numberParser],
    ["name", "name", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface AgentReq {
    readonly personId: PersonId;
    readonly talentAgencyId: TalentAgencyId;
    readonly email: string | null;
}

interface AgentDef {
    readonly id: AgentId;
}

export type AgentCols<s> = MakeCols<s, AgentReq & AgentDef>;
export type AgentTable = MakeTable<AgentReq, AgentDef>;

export const agentTable = declareTable<AgentReq, AgentDef>("agent", [
    ["id", "id", SqlType.numberParser],
    ["person_id", "personId", SqlType.numberParser],
    ["talent_agency_id", "talentAgencyId", SqlType.numberParser],
    ["email", "email", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface PerformerReq {
    readonly personId: PersonId;
    readonly sex: Sex;
    readonly height: number | null;
}

interface PerformerDef {
    readonly id: PerformerId;
}

export type PerformerCols<s> = MakeCols<s, PerformerReq & PerformerDef>;
export type PerformerTable = MakeTable<PerformerReq, PerformerDef>;

export const performerTable = declareTable<PerformerReq, PerformerDef>("performer", [
    ["id", "id", SqlType.numberParser],
    ["person_id", "personId", SqlType.numberParser],
    ["sex", "sex", SqlType.stringParser],
    ["height", "height", SqlType.numberParser]
]);

// --------------------------------------------------------------------

interface PerformerPhotoReq {
    readonly personId: PersonId;
    readonly payload: object;
}

interface PerformerPhotoDef {
    readonly id: PerformerPhotoId;
}

export type PerformerPhotoCols<s> = MakeCols<s, PerformerPhotoReq & PerformerPhotoDef>;
export type PerformerPhotoTable = MakeTable<PerformerPhotoReq, PerformerPhotoDef>;

export const performerPhotoTable = declareTable<PerformerPhotoReq, PerformerPhotoDef>("performer_photo", [
    ["id", "id", SqlType.numberParser],
    ["person_id", "personId", SqlType.numberParser],
    ["payload", "payload", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface PerformerAgencyContractReq {
    readonly performerId: PerformerId;
    readonly talentAgencyId: TalentAgencyId;
    readonly signedAt: Date;
    readonly terminatedAt: Date | null;
}

interface PerformerAgencyContractDef {
    readonly id: PerformerAgencyContractId;
}

export type PerformerAgencyContractCols<s> = MakeCols<s, PerformerAgencyContractReq & PerformerAgencyContractDef>;
export type PerformerAgencyContractTable = MakeTable<PerformerAgencyContractReq, PerformerAgencyContractDef>;

export const performerAgencyContractTable = declareTable<PerformerAgencyContractReq, PerformerAgencyContractDef>("performer_agency_contract", [
    ["id", "id", SqlType.numberParser],
    ["performer_id", "performerId", SqlType.numberParser],
    ["talent_agency_id", "talentAgencyId", SqlType.numberParser],
    ["signed_at", "signedAt", SqlType.stringParser],
    ["terminated_at", "terminatedAt", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface SingingSkillReq {
    readonly id: SingingSkillId;
    readonly performerId: PerformerId;
    readonly voiceType: VoiceType;
}

interface SingingSkillDef {
    readonly id: SingingSkillId;
}

export type SingingSkillCols<s> = MakeCols<s, SingingSkillReq & SingingSkillDef>;
export type SingingSkillTable = MakeTable<SingingSkillReq, SingingSkillDef>;

export const singingSkillTable = declareTable<SingingSkillReq, SingingSkillDef>("singing_skill", [
    ["id", "id", SqlType.numberParser],
    ["performer_id", "performerId", SqlType.numberParser],
    ["voice_type", "voiceType", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface ComedySkillReq {
    readonly performerId: PerformerId;
    readonly comedyDescription: string;
}

interface ComedySkillDef {
    readonly id: ComedySkillId;
}

export type ComedySkillCols<s> = MakeCols<s, ComedySkillReq & ComedySkillDef>;
export type ComedySkillTable = MakeTable<ComedySkillReq, ComedySkillDef>;

export const comedySkillTable = declareTable<ComedySkillReq, ComedySkillDef>("comedy_skill", [
    ["id", "id", SqlType.numberParser],
    ["performer_id", "performerId", SqlType.numberParser],
    ["comedy_description", "comedyDescription", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface ActingSkillReq {
    readonly id: ActingSkillId;
    readonly performerId: PerformerId;
    readonly stunts: boolean;
}

interface ActingSkillDef {
    readonly id: ActingSkillId;
}

export type ActingSkillCols<s> = MakeCols<s, ActingSkillReq & ActingSkillDef>;
export type ActingSkillTable = MakeTable<ActingSkillReq, ActingSkillDef>;

export const actingSkillTable = declareTable<ActingSkillReq, ActingSkillDef>("acting_skill", [
    ["id", "id", SqlType.numberParser],
    ["performer_id", "performerId", SqlType.numberParser],
    ["stunts", "stunts", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface AuditionReq {
    readonly title: string;
    readonly time: Date;
    readonly sex: Sex | null;
}

interface AuditionDef {
    readonly id: AuditionId;
}

export type AuditionCols<s> = MakeCols<s, AuditionReq & AuditionDef>;
export type AuditionTable = MakeTable<AuditionReq, AuditionDef>;

export const auditionTable = declareTable<AuditionReq, AuditionDef>("audition", [
    ["id", "id", SqlType.numberParser],
    ["title", "title", SqlType.stringParser],
    ["time", "time", SqlType.stringParser],
    ["sex", "sex", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface RecommendedAuditionReq {
    readonly auditionId: AuditionId;
    readonly agentId: AgentId;
}

interface RecommendedAuditionDef {
    readonly id: RecommendedAuditionId;
}

export type RecommendedAuditionCols<s> = MakeCols<s, RecommendedAuditionReq & RecommendedAuditionDef>;
export type RecommendedAuditionTable = MakeTable<RecommendedAuditionReq, RecommendedAuditionDef>;

export const recommendedAuditionTable = declareTable<RecommendedAuditionReq, RecommendedAuditionDef>("recommended_audition", [
    ["id", "id", SqlType.numberParser],
    ["audition_id", "auditionId", SqlType.numberParser],
    ["agent_id", "agentId", SqlType.numberParser]
]);

// --------------------------------------------------------------------

interface AuditionPerformanceReq {
    readonly auditionId: AuditionId;
    readonly performerId: PerformerId;
    readonly referredByAgentId: AgentId | null;
    readonly auditionedAt: Date;
}

interface AuditionPerformanceDef {
    readonly id: AuditionPerformanceId;
}

export type AuditionPerformanceCols<s> = MakeCols<s, AuditionPerformanceReq & AuditionPerformanceDef>;
export type AuditionPerformanceTable = MakeTable<AuditionPerformanceReq, AuditionPerformanceDef>;

export const auditionPerformanceTable = declareTable<AuditionPerformanceReq, AuditionPerformanceDef>("audition_performance", [
    ["id", "id", SqlType.numberParser],
    ["audition_id", "auditionId", SqlType.numberParser],
    ["performer_id", "performerId", SqlType.numberParser],
    ["referred_by_agent_id", "referredByAgentId", SqlType.numberParser],
    ["auditioned_at", "auditionedAt", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface AuditionOutcomeReq {
    readonly auditionId: AuditionId;
    readonly winningPerformanceId: AuditionPerformanceId;
    readonly decidedAt: Date;
}

interface AuditionOutcomeDef {
    readonly id: AuditionOutcomeId;
}

export type AuditionOutcomeCols<s> = MakeCols<s, AuditionOutcomeReq & AuditionOutcomeDef>;
export type AuditionOutcomeTable = MakeTable<AuditionOutcomeReq, AuditionOutcomeDef>;

export const auditionOutcomeTable = declareTable<AuditionOutcomeReq, AuditionOutcomeDef>("audition_outcome", [
    ["id", "id", SqlType.numberParser],
    ["audition_id", "auditionId", SqlType.numberParser],
    ["winning_performance_id", "winningPerformanceId", SqlType.numberParser],
    ["decided_at", "decidedAt", SqlType.stringParser]
]);

// --------------------------------------------------------------------

interface StatusUpdateReq {
    readonly personId: PersonId;
    readonly date: Date;
    readonly payload: string;
}

interface StatusUpdateDef {
    readonly id: StatusUpdateId;
}

export type StatusUpdateCols<s> = MakeCols<s, StatusUpdateReq & StatusUpdateDef>;
export type StatusUpdateTable = MakeTable<StatusUpdateReq, StatusUpdateDef>;

export const statusUpdateTable = declareTable<StatusUpdateReq, StatusUpdateDef>("status_update", [
    ["id", "id", SqlType.numberParser],
    ["person_id", "personId", SqlType.numberParser],
    ["date", "date", SqlType.stringParser],
    ["payload", "payload", SqlType.stringParser]
]);

// --------------------------------------------------------------------

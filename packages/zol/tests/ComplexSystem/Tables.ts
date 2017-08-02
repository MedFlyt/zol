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

export const talentAgencyTable = declareTable<TalentAgencyReq, TalentAgencyDef>("talent_agency", {
    id: ["id", <any>SqlType.numberParser],
    name: ["name", SqlType.stringParser],
    website: ["website", SqlType.stringParser]
});

// --------------------------------------------------------------------

interface PersonReq {
    readonly name: string;
}

interface PersonDef {
    readonly id: PersonId;
}

export type PersonCols<s> = MakeCols<s, PersonReq & PersonDef>;
export type PersonTable = MakeTable<PersonReq, PersonDef>;

export const personTable = declareTable<PersonReq, PersonDef>("person", {
    id: ["id", <any>SqlType.numberParser],
    name: ["name", SqlType.stringParser]
});

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

export const agentTable = declareTable<AgentReq, AgentDef>("agent", {
    id: ["id", <any>SqlType.numberParser],
    personId: ["person_id", <any>SqlType.numberParser],
    talentAgencyId: ["talent_agency_id", <any>SqlType.numberParser],
    email: ["email", SqlType.stringParser]
});

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

export const performerTable = declareTable<PerformerReq, PerformerDef>("performer", {
    id: ["id", <any>SqlType.numberParser],
    personId: ["person_id", <any>SqlType.numberParser],
    sex: ["sex", <any>SqlType.stringParser],
    height: ["height", SqlType.numberParser]
});

// --------------------------------------------------------------------

interface PerformerPhotoReq {
    readonly personId: PersonId;
    readonly payload: string;
}

interface PerformerPhotoDef {
    readonly id: PerformerPhotoId;
}

export type PerformerPhotoCols<s> = MakeCols<s, PerformerPhotoReq & PerformerPhotoDef>;
export type PerformerPhotoTable = MakeTable<PerformerPhotoReq, PerformerPhotoDef>;

export const performerPhotoTable = declareTable<PerformerPhotoReq, PerformerPhotoDef>("performer_photo", {
    id: ["id", <any>SqlType.numberParser],
    personId: ["person_id", <any>SqlType.numberParser],
    payload: ["payload", SqlType.stringParser]
});

// --------------------------------------------------------------------

interface PerformerAgencyContractReq {
    readonly performerId: PerformerId;
    readonly talentAgencyId: TalentAgencyId;
    readonly signedAt: string;
    readonly terminatedAt: string | null;
}

interface PerformerAgencyContractDef {
    readonly id: PerformerAgencyContractId;
}

export type PerformerAgencyContractCols<s> = MakeCols<s, PerformerAgencyContractReq & PerformerAgencyContractDef>;
export type PerformerAgencyContractTable = MakeTable<PerformerAgencyContractReq, PerformerAgencyContractDef>;

export const performerAgencyContractTable = declareTable<PerformerAgencyContractReq, PerformerAgencyContractDef>("performer_agency_contract", {
    id: ["id", <any>SqlType.numberParser],
    performerId: ["performer_id", <any>SqlType.numberParser],
    talentAgencyId: ["talent_agency_id", <any>SqlType.numberParser],
    signedAt: ["signed_at", SqlType.stringParser],
    terminatedAt: ["terminated_at", SqlType.stringParser]
});

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

export const singingSkillTable = declareTable<SingingSkillReq, SingingSkillDef>("singing_skill", {
    id: ["id", <any>SqlType.numberParser],
    performerId: ["performer_id", <any>SqlType.numberParser],
    voiceType: ["voice_type", <any>SqlType.stringParser]
});

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

export const comedySkillTable = declareTable<ComedySkillReq, ComedySkillDef>("comedy_skill", {
    id: ["id", <any>SqlType.numberParser],
    performerId: ["performer_id", <any>SqlType.numberParser],
    comedyDescription: ["comedy_description", SqlType.stringParser]
});

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

export const actingSkillTable = declareTable<ActingSkillReq, ActingSkillDef>("acting_skill", {
    id: ["id", <any>SqlType.numberParser],
    performerId: ["performer_id", <any>SqlType.numberParser],
    stunts: ["stunts", SqlType.booleanParser]
});

// --------------------------------------------------------------------

interface AuditionReq {
    readonly title: string;
    readonly time: string;
    readonly sex: Sex | null;
}

interface AuditionDef {
    readonly id: AuditionId;
}

export type AuditionCols<s> = MakeCols<s, AuditionReq & AuditionDef>;
export type AuditionTable = MakeTable<AuditionReq, AuditionDef>;

export const auditionTable = declareTable<AuditionReq, AuditionDef>("audition", {
    id: ["id", <any>SqlType.numberParser],
    title: ["title", SqlType.stringParser],
    time: ["time", SqlType.stringParser],
    sex: ["sex", <any>SqlType.stringParser]
});

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

export const recommendedAuditionTable = declareTable<RecommendedAuditionReq, RecommendedAuditionDef>("recommended_audition", {
    id: ["id", <any>SqlType.numberParser],
    auditionId: ["audition_id", <any>SqlType.numberParser],
    agentId: ["agent_id", <any>SqlType.numberParser]
});

// --------------------------------------------------------------------

interface AuditionPerformanceReq {
    readonly auditionId: AuditionId;
    readonly performerId: PerformerId;
    readonly referredByAgentId: AgentId | null;
    readonly auditionedAt: string;
}

interface AuditionPerformanceDef {
    readonly id: AuditionPerformanceId;
}

export type AuditionPerformanceCols<s> = MakeCols<s, AuditionPerformanceReq & AuditionPerformanceDef>;
export type AuditionPerformanceTable = MakeTable<AuditionPerformanceReq, AuditionPerformanceDef>;

export const auditionPerformanceTable = declareTable<AuditionPerformanceReq, AuditionPerformanceDef>("audition_performance", {
    id: ["id", <any>SqlType.numberParser],
    auditionId: ["audition_id", <any>SqlType.numberParser],
    performerId: ["performer_id", <any>SqlType.numberParser],
    referredByAgentId: ["referred_by_agent_id", <any>SqlType.numberParser],
    auditionedAt: ["auditioned_at", SqlType.stringParser]
});

// --------------------------------------------------------------------

interface AuditionOutcomeReq {
    readonly auditionId: AuditionId;
    readonly winningPerformanceId: AuditionPerformanceId;
    readonly decidedAt: string;
}

interface AuditionOutcomeDef {
    readonly id: AuditionOutcomeId;
}

export type AuditionOutcomeCols<s> = MakeCols<s, AuditionOutcomeReq & AuditionOutcomeDef>;
export type AuditionOutcomeTable = MakeTable<AuditionOutcomeReq, AuditionOutcomeDef>;

export const auditionOutcomeTable = declareTable<AuditionOutcomeReq, AuditionOutcomeDef>("audition_outcome", {
    id: ["id", <any>SqlType.numberParser],
    auditionId: ["audition_id", <any>SqlType.numberParser],
    winningPerformanceId: ["winning_performance_id", <any>SqlType.numberParser],
    decidedAt: ["decided_at", SqlType.stringParser]
});

// --------------------------------------------------------------------

interface StatusUpdateReq {
    readonly personId: PersonId;
    readonly date: string;
    readonly payload: string;
}

interface StatusUpdateDef {
    readonly id: StatusUpdateId;
}

export type StatusUpdateCols<s> = MakeCols<s, StatusUpdateReq & StatusUpdateDef>;
export type StatusUpdateTable = MakeTable<StatusUpdateReq, StatusUpdateDef>;

export const statusUpdateTable = declareTable<StatusUpdateReq, StatusUpdateDef>("status_update", {
    id: ["id", <any>SqlType.numberParser],
    personId: ["person_id", <any>SqlType.numberParser],
    date: ["date", SqlType.stringParser],
    payload: ["payload", SqlType.stringParser]
});

// --------------------------------------------------------------------

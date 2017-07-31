import { Col, textCol } from "../../src/zol";

export const enum Sex {
    MALE = "MALE",
    FEMALE = "FEMALE"
}

export const enum VoiceType {
    SOPRANO = "SOPRANO",
    TENOR = "TENOR",
    BARITONE = "BARITONE"
}

export function sexCol<s>(val: Sex): Col<s, Sex> {
    return <any>textCol(val);
}

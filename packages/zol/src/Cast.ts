import { Col } from "./Column";

const PGTimestamp = "PGTimestamp";

export function cast<s, a>(col: Col<s, a>, type: "PGInt"): Col<s, number>;
export function cast<s, a>(col: Col<s, a>, type: "PGTimestamp"): Col<s, Date>;

export function cast<s, a>(_col: Col<s, a>, _type: any): Col<s, any> {
    throw new Error("TODO");
}

export function x<s>(col: Col<s, number>) {
    const y = cast(col, PGTimestamp);
    return y;
}

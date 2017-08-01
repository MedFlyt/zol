import { Col, SqlType, unsafeFun } from "zol";

export function sqrt<s>(val: Col<s, number>): Col<s, number> {
    return unsafeFun("SQRT", val, SqlType.numberParser);
}

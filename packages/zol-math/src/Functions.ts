import { Col, SqlType, Unsafe } from "zol";

export function sqrt<s>(val: Col<s, number>): Col<s, number> {
    return Unsafe.unsafeFun("SQRT", val, SqlType.numberParser);
}

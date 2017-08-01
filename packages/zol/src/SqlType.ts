export type Lit =
    Lit.LText |
    Lit.LInt |
    Lit.LDouble |
    Lit.LBool |
    Lit.LDateTime |
    Lit.LDate |
    Lit.LTime |
    Lit.LNull;

export namespace Lit {
    export interface LText {
        type: "LText";
        value: string;
    }

    export interface LInt {
        type: "LInt";
        value: number;
    }

    export interface LDouble {
        type: "LDouble";
        value: number;
    }

    export interface LBool {
        type: "LBool";
        value: boolean;
    }

    export interface LDateTime {
        type: "LDateTime";
        value: Date;
    }

    export interface LDate {
        type: "LDate";
        value: string;
    }

    export interface LTime {
        type: "LTime";
        value: string;
    }

    export interface LNull {
        type: "LNull";
    }
}

export namespace SqlType {
    export function intParser(val: string): number {
        return parseInt(val, 10);
    }

    export function numberParser(val: string): number {
        return parseFloat(val);
    }

    export function stringParser(val: string): string {
        return val;
    }

    export function booleanParser(val: string): boolean {
        return val === "t" ? true : false;
    }
}

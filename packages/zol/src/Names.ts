import { assertNever } from "./assertNever";
import { Exp, SomeCol } from "./Exp";
import { SQL, SqlSource } from "./SQL";
import { ColName } from "./Types";

export function allNamesInExp<a>(exp: Exp<SQL, a>): ColName[] {
    switch (exp.type) {
        case "ECol":
            return [exp.colName];
        case "ETblCol":
            return exp.colNames;
        case "ELit":
            return [];
        case "EBinOp":
            return allNamesInExp(exp.lhs).concat(allNamesInExp(exp.rhs));
        case "ECustomBinOp":
            return allNamesInExp(exp.lhs).concat(allNamesInExp(exp.rhs));
        case "EUnOp":
            return allNamesInExp(exp.exp);
        case "EFun2":
            return allNamesInExp(exp.lhs).concat(allNamesInExp(exp.rhs));
        case "EFun3":
            return allNamesInExp(exp.col1).concat(allNamesInExp(exp.col2)).concat(allNamesInExp(exp.col3));
        case "ECast":
            return allNamesInExp(exp.exp);
        case "EIfThenElse":
            return allNamesInExp(exp.expIf).concat(allNamesInExp(exp.expThen)).concat(allNamesInExp(exp.expElse));
        case "EAggrEx":
            return allNamesInExp(exp.exp);
        case "EInList": {
            let result: ColName[] = [];
            result = result.concat(allNamesInExp(exp.exp));
            for (const e of exp.exps) {
                result = result.concat(allNamesInExp(e));
            }
            return result;
        }
        case "EInQuery":
            return allNamesInExp(exp.exp).concat(allNamesInSQL(exp.sql));
        case "EExists":
            return allNamesInSQL(exp.sql);
        /* istanbul ignore next */
        default:
            return assertNever(exp);
    }
}

export function allNamesInExps<a>(exps: Exp<SQL, a>[]): ColName[] {
    let result: ColName[] = [];
    for (const exp of exps) {
        result = result.concat(allNamesInExp(exp));
    }
    return result;
}

export function allNamesInSomeCol(c: SomeCol<SQL>): ColName[] {
    switch (c.type) {
        case "Some":
            return allNamesInExp(c.exp);
        case "Named":
            return [c.colName].concat(allNamesInExp(c.exp));
        /* istanbul ignore next */
        default:
            return assertNever(c);
    }
}

export function allNamesInSomeCols(cs: SomeCol<SQL>[]): ColName[] {
    let result: ColName[] = [];
    for (const c of cs) {
        result = result.concat(allNamesInSomeCol(c));
    }
    return result;
}

export function allNamesInSQL(sql: SQL): ColName[] {
    let result: ColName[] = [];
    result = result.concat(allNamesInSomeCols(sql.groups));
    result = result.concat(allNamesInSomeCols(sql.ordering.map(x => x[1])));
    result = result.concat(allNamesInExps(sql.restricts));
    result = result.concat(allNamesInSqlSource(sql.source));
    return result;
}

export function allNamesInSQLs(sqls: SQL[]): ColName[] {
    let result: ColName[] = [];
    for (const sql of sqls) {
        result = result.concat(allNamesInSQL(sql));
    }
    return result;
}

export function allNamesInSqlSource(source: SqlSource): ColName[] {
    switch (source.type) {
        case "Product":
            return allNamesInSQLs(source.sqls);
        case "Join":
            return allNamesInExp(source.exp).concat(allNamesInSQL(source.left)).concat(allNamesInSQL(source.right));
        case "Values":
            return allNamesInSomeCols(source.cols);
        case "TableName":
            return [];
        case "EmptyTable":
            return [];
        /* istanbul ignore next */
        default:
            return assertNever(source);
    }
}

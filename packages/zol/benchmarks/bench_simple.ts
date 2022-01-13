import "../../../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import { withTestDatabase } from "../../../helper_framework/TestDb";
import { Debug, declareTable, MakeCols, MakeTable, pg, query, select, SqlType } from "../src/zol";
import { Benchmark } from "./Benchmark";
import { QueryBenchmark } from "./QueryBenchmark";

interface PersonReq {
    readonly name: string;
}

interface PersonDef {
    readonly age: number;
}

export type PersonCols<s> = MakeCols<s, PersonReq & PersonDef>;
export type PersonTable = MakeTable<PersonReq, PersonDef>;

export const personTable = declareTable<PersonReq, PersonDef>("person", {
    name: ["name", SqlType.stringParser],
    age: ["age", SqlType.numberParser]
});

class StupidBenchmark extends QueryBenchmark {
    public constructor(private conn: pg.Client) {
        super();
    }

    public async setup(): Promise<void> {
        await pg.query_(this.conn,
            `
            CREATE TABLE person (
                name TEXT NOT NULL,
                age TEXT NOT NULL
            );
            `);
    }

    public async run(): Promise<Debug.QueryMetrics> {
        await query("", this.conn, q => {
            return select(q, personTable);
        });
        return Debug.getLastQueryMetrics(this.conn);
    }
}

function main() {
    Debug.enableDebug();

    withTestDatabase(async (conn: pg.Client) => {
        const bench = new StupidBenchmark(conn);

        const results = await Benchmark.runBenchmark(bench, 10000);
        Benchmark.printResults(results);
    });
}

main();

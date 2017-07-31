import "../helper_framework/boot"; // tslint:disable-line:no-import-side-effect

import { withTestDatabase } from "../helper_framework/db";
import { Debug, declareTable, pg, query, select, SqlType } from "../src/zol";
import { Benchmark } from "./Benchmark";
import { QueryBenchmark } from "./QueryBenchmark";

interface LargeReq {
    readonly a: string | null;
    readonly b: number | null;
    readonly c: boolean | null;
    readonly d: string | null;
    readonly e: number | null;
    readonly f: boolean | null;
    readonly g: string | null;
    readonly h: number | null;
    readonly i: boolean | null;
    readonly j: string | null;
    readonly k: number | null;
}

export const personTable = declareTable<LargeReq, {}>("large", [
    ["a", "a", SqlType.stringParser],
    ["b", "b", SqlType.numberParser],
    ["c", "c", SqlType.booleanParser],
    ["d", "d", SqlType.stringParser],
    ["e", "e", SqlType.numberParser],
    ["f", "f", SqlType.booleanParser],
    ["g", "g", SqlType.stringParser],
    ["h", "h", SqlType.numberParser],
    ["i", "i", SqlType.booleanParser],
    ["j", "j", SqlType.stringParser],
    ["k", "k", SqlType.numberParser]
]);

export class HugeResultsBenchmark extends QueryBenchmark {
    constructor(private conn: pg.Client) {
        super();
    }

    public async setup(): Promise<void> {
        await pg.query_(this.conn,
            `
            CREATE TABLE large (
                a TEXT,
                b INT,
                c BOOLEAN,
                d TEXT,
                e INT,
                f BOOLEAN,
                g TEXT,
                h INT,
                i BOOLEAN,
                j TEXT,
                k INT
            );
            `);

        for (let i = 0; i < 10000; ++i) {
            await pg.query_(this.conn,
                `
                INSERT INTO large
                    (a, b, c, d, e, f, g, h, i, j, k)
                VALUES
                    ('${i}', '${i}', '${i % 2 === 0}', ${i}, ${i}, '${i % 3 === 0}', '${i}', '${i}', '${i % 3 === 0}', '${i}', '${i}');
                `);
        }
    }

    public async run(): Promise<Debug.QueryMetrics> {
        await query(this.conn, q => {
            return select(q, personTable);
        });
        return Debug.getLastQueryMetrics(this.conn);
    }
}

function main() {
    Debug.enableDebug();

    withTestDatabase(async (conn: pg.Client) => {
        const bench = new HugeResultsBenchmark(conn);

        const results = await Benchmark.runBenchmark(bench, 1000);
        Benchmark.printResults(results);
    });
}

main();

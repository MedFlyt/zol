import * as pgLib from "pg";
import { pg } from "./pg";

export let enabled: boolean = false;
export const lastQueryMetrics = new Map<pgLib.Client, Debug.QueryMetrics>();

/**
 * Logs generated SQL strings and execution timing metrics
 */
export namespace Debug {

    export function enableDebug() {
        enabled = true;
    }

    export function disableDebug() {
        enabled = false;
        lastQueryMetrics.clear();
    }

    export function debugEnabled(): boolean {
        return enabled;
    }

    export class QueryMetrics {
        protected querySQL_: string; // tslint:disable-line:variable-name

        protected stage1BeforeCompileQuery: [number, number];
        protected stage2BeforeCompileSql: [number, number];
        protected stage3BeforeRunQuery: [number, number];
        protected stage4BeforeParseQueryResults: [number, number];
        protected stage5End: [number, number];

        public querySQL(): string {
            return this.querySQL_;
        }

        public compileQueryTime(): number {
            return diffTime(this.stage2BeforeCompileSql, this.stage1BeforeCompileQuery);
        }

        public compileSqlTime(): number {
            return diffTime(this.stage3BeforeRunQuery, this.stage2BeforeCompileSql);
        }

        public runQueryTime(): number {
            return diffTime(this.stage4BeforeParseQueryResults, this.stage3BeforeRunQuery);
        }

        public parseQueryResultsTime(): number {
            return diffTime(this.stage5End, this.stage4BeforeParseQueryResults);
        }

        public totalTime(): number {
            return diffTime(this.stage5End, this.stage1BeforeCompileQuery);
        }
    }

    export function getLastQueryMetrics(conn: pg.Client): QueryMetrics {
        if (!enabled) {
            throw new Error("Debug mode must be enabled with `enableDebug`");
        }

        const metric = lastQueryMetrics.get(conn);
        if (metric === undefined) {
            throw new Error("No Query has been run yet");
        }
        return metric;
    }
}

/**
 * @param param0 endTime as returned from process.hrtime()
 * @param param1 startTime as returned from process.hrtime()
 * @returns Difference in nanoseconds between startTime and endTime
 */
function diffTime([endSeconds, endNanoseconds]: [number, number], [startSeconds, startNanoseconds]: [number, number]): number {
    let nanoDiff = endNanoseconds - startNanoseconds;
    let secondsDiff = endSeconds - startSeconds;
    if (nanoDiff < 0) {
        secondsDiff -= 1;
        nanoDiff += 1000000000;
    }
    return (secondsDiff * 1000000000) + nanoDiff;
}

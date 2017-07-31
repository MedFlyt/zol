import { Debug } from "../src/zol";
import { Benchmark, BenchmarkResult } from "./Benchmark";

export abstract class QueryBenchmark extends Benchmark<Debug.QueryMetrics> {

    public toResults(measurement: Debug.QueryMetrics): BenchmarkResult[] {
        return [
            {
                measurementName: "compile query",
                milliseconds: measurement.compileQueryTime() / 1000000
            },
            {
                measurementName: "compile sql",
                milliseconds: measurement.compileSqlTime() / 1000000
            },
            {
                measurementName: "parse query results",
                milliseconds: measurement.parseQueryResultsTime() / 1000000
            }
        ];
    }
}

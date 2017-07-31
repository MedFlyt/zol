export interface BenchmarkResult {
    measurementName: string;
    milliseconds: number;
}

export abstract class Benchmark<T> {
    public async setup(): Promise<void> { /* setup is not required */ }

    public abstract run(): Promise<T>;

    public abstract toResults(measurement: T): BenchmarkResult[];
}

export namespace Benchmark {
    export async function runBenchmark<T>(benchmark: Benchmark<T>, numIterations: number): Promise<BenchmarkResult[]> {
        const allMeasurements: T[] = [];

        await benchmark.setup();
        for (let i = 0; i < numIterations; ++i) {
            const measurement = await benchmark.run();
            allMeasurements.push(measurement);
        }

        const results = allMeasurements.map(r => benchmark.toResults(r));
        return aggregateResults(results);
    }

    function aggregateResults(benchmarkResults: BenchmarkResult[][]): BenchmarkResult[] {
        const numFields = benchmarkResults[0].length;

        const aggregation: BenchmarkResult[] = [];

        for (let i = 0; i < numFields; ++i) {
            const averageMilliseconds = aggregateResultsField(benchmarkResults, i);
            aggregation.push({
                measurementName: benchmarkResults[0][i].measurementName,
                milliseconds: averageMilliseconds
            });
        }

        return aggregation;
    }

    function aggregateResultsField(benchmarkResults: BenchmarkResult[][], fieldNum: number): number {
        let timings: number[] = [];
        for (const benchmarkResult of benchmarkResults) {
            timings.push(benchmarkResult[fieldNum].milliseconds);
        }
        timings.sort();

        // Ignore any outliers that would skew the results
        const PERCENTILE_CUTOFF = 95;
        timings = timings.slice(0, Math.floor(timings.length * PERCENTILE_CUTOFF / 100));

        let sum = 0;
        timings.forEach(t => sum += t);
        const average = sum / timings.length;
        return average;
    }

    export function printResults(benchmarkResults: BenchmarkResult[]): void {
        for (const result of benchmarkResults) {
            console.log(`${pad(48, result.measurementName + ":", " ")}${result.milliseconds.toFixed(3)} ms`);
        }
    }

    function pad(width: number, str: string, padding: string): string {
        return (width <= str.length) ? str : pad(width, str + padding, padding);
    }
}

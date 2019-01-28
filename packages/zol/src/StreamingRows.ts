export interface StreamingRows<T> {
    /**
     * Read in all of the results, the callback will be called multiple times,
     * each time with a new batch of results.
     */
    readAllRows(action: (results: T[]) => Promise<void>): Promise<void>;
}

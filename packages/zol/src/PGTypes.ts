/**
 * Calendar date (year, month, day)
 */
export class PGDate {
    public readonly year: number;
    public readonly month: number;
    public readonly day: number;

    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGDate { throw new Error(); }
}

export class PGTime {
    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGTime { throw new Error(); }
}

export class PGTimeStamp {
    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGTimeStamp { throw new Error(); }
}

export class PGTimeStamptz {
    /* istanbul ignore next */
    private constructor() { this.dummy(); }
    /* istanbul ignore next */
    private dummy(): PGTimeStamptz { throw new Error(); }
}

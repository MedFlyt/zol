/**
 * Calendar date (year, month, day)
 */
export class PGDate {
    public readonly year: number;
    public readonly month: number;
    public readonly day: number;

    protected dummy: PGDate;
}

export class PGTime {
    protected dummy: PGTime;
}

export class PGTimeStamp {
    protected dummy: PGTimeStamp;
}

export class PGTimeStamptz {
    protected dummy: PGTimeStamptz;
}

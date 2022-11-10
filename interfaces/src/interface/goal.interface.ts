/**
 * Goal interface
 */
export interface IGoal {
    /**
     * Topic id
     */
    topicId?: string;

    /**
     * User did
     */
    userDid: string;

    /**
     * Report date from
     */
    reportDateFrom: Date;

    /**
     * Report date to
     */
    reportDateTo: Date;

    /**
     * Comparison date from
     */
    comparisonDateFrom: Date;

    /**
     * Comparison date to
     */
    comparisonDateTo: Date;

    /**
     * Comparison emissions
     */
    comparisonEmissions: number;

    /**
     * Removal
     */
    removal: number;

    /**
     * Reduction
     */
    reduction: number;

    /**
     * Goal emissions
     */
    goalEmissions: number;

    /**
     * Total removal
     */
    totalRemoval: number;
}

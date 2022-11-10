import { IGoal } from '@guardian/interfaces';
import {
    Entity,
    Property,
} from '@mikro-orm/core';
import { BaseEntity } from '@guardian/common';

/**
 * Goal collection
 */
@Entity()
export class Goal extends BaseEntity implements IGoal {
    /**
     * Topic id
     */
    @Property()
    topicId?: string;

    /**
     * User did
     */
    @Property()
    userDid: string;

    /**
     * Comparison date from
     */
    @Property()
    comparisonDateFrom: Date = new Date();

    /**
     * Comparison date to
     */
    @Property()
    comparisonDateTo: Date = new Date();

    /**
     * Report date from
     */
    @Property()
    reportDateFrom: Date = new Date();

    /**
     * Report date to
     */
    @Property()
    reportDateTo: Date = new Date();

    /**
     * Comparison emissions
     */
    @Property()
    comparisonEmissions: number;

    /**
     * Goal emissions
     */
    @Property()
    goalEmissions: number;

    /**
     * Reduction
     */
    @Property()
    reduction: number;

    /**
     * Removal
     */
    @Property()
    removal: number;

    /**
     * Total removal
     */
    @Property()
    totalRemoval: number;
}

import { Goal } from '@entity/goal';
import { Message } from './message';
import { IURL } from './url.interface';
import { MessageAction } from './message-action';
import { MessageType } from './message-type';
import { GoalMessageBody } from './message-body.interface';

/**
 * Goal message
 */
export class GoalMessage extends Message {
    /**
     * User did
     */
    public userDid: string;

    /**
     * Report date from
     */
    public reportDateFrom: Date;

    /**
     * Report date to
     */
    public reportDateTo: Date;

    /**
     * Comparison date from
     */
    public comparisonDateFrom: Date;

    /**
     * Comparison date to
     */
    public comparisonDateTo: Date;

    /**
     * Comparison emissions
     */
    public comparisonEmissions: number;

    /**
     * Removal
     */
    public removal: number;

    /**
     * Reduction
     */
    public reduction: number;

    /**
     * Goal emissions
     */
    public goalEmissions: number;

    /**
     * Total removal
     */
    public totalRemoval: number;

    constructor(action: MessageAction) {
        super(action, MessageType.Goal);
    }

    /**
     * Set document
     * @param goal
     */
    public setDocument(goal: Goal): void {
        this.userDid = goal.userDid;
        this.reportDateFrom = goal.reportDateFrom;
        this.reportDateTo = goal.reportDateTo;
        this.comparisonDateFrom = goal.comparisonDateFrom;
        this.removal = goal.removal;
        this.reduction = goal.reduction;
        this.goalEmissions = goal.goalEmissions;
        this.totalRemoval = goal.totalRemoval;
    }

    /**
     * To message object
     */
    public override toMessageObject(): GoalMessageBody {
        return {
            id: null,
            status: null,
            type: this.type,
            action: this.action,
            lang: this.lang,
            reportDateFrom: this.reportDateFrom,
            reportDateTo: this.reportDateTo,
            comparisonDateFrom: this.comparisonDateFrom,
            comparisonDateTo: this.comparisonDateTo,
            comparisonEmissions: this.comparisonEmissions,
            goalEmissions: this.goalEmissions,
            reduction: this.reduction,
            removal: this.removal,
            totalRemoval: this.totalRemoval,
            userDid: this.userDid
        };
    }

    /**
     * To documents
     */
    public async toDocuments(): Promise<ArrayBuffer[]> {
        return [];
    }

    /**
     * Load documents
     * @param documents
     */
    public loadDocuments(documents: string[]): GoalMessage {
        return this;
    }

    /**
     * From message
     * @param message
     */
    public static fromMessage(message: string): GoalMessage {
        if (!message) {
            throw new Error('Message Object is empty');
        }

        const json = JSON.parse(message);
        return GoalMessage.fromMessageObject(json);
    }

    /**
     * From message object
     * @param json
     */
    public static fromMessageObject(json: GoalMessageBody): GoalMessage {
        if (!json) {
            throw new Error('JSON Object is empty');
        }

        if (json.type !== MessageType.Goal) {
            throw new Error('Invalid message type');
        }

        let message = new GoalMessage(json.action);
        message = Message._fromMessageObject(message, json);
        message._id = json.id;
        message._status = json.status;

        message.reportDateFrom = json.reportDateFrom;
        message.reportDateTo = json.reportDateTo;
        message.comparisonDateFrom = json.comparisonDateFrom;
        message.comparisonDateTo = json.comparisonDateTo;
        message.comparisonEmissions = json.comparisonEmissions;
        message.goalEmissions = json.goalEmissions;
        message.reduction = json.reduction;
        message.removal = json.removal;
        message.totalRemoval = json.totalRemoval;
        message.userDid = json.userDid;

        const urls = []
        message.setUrls(urls);
        return message;
    }

    /**
     * Validate
     */
    public override validate(): boolean {
        return true;
    }

    /**
     * Get URLs
     */
    public getUrls(): IURL[] {
        return [];
    }
}

import {
    IGoal,
    MessageAPI,
} from '@guardian/interfaces';
import { ApiResponse } from '@api/api-response';
import { MessageBrokerChannel, MessageResponse, MessageError, Logger } from '@guardian/common';
import { DatabaseServer } from '@database-modules';
import {emptyNotifier, INotifier} from '@helpers/notifier';
import { Goal as GoalCollection } from '@entity/goal';
import { Users } from '@helpers/users';
import { Topic } from '@entity/topic';
import { MessageAction, MessageServer, GoalMessage } from '@hedera-modules';

/**
 * Create gaol
 * @param newGoal
 * @param owner
 */
async function createGoal(newGoal: IGoal, owner: string, notifier: INotifier): Promise<GoalCollection> {
    const users = new Users();
    notifier.start('Resolve Hedera account');
    const root = await users.getHederaAccount(owner);
    notifier.completedAndStart('Save in DB');
    const goalObject = DatabaseServer.createGoal(newGoal);
    notifier.completedAndStart('Resolve Topic');
    let topic: Topic;
    if (newGoal.topicId) {
        topic = await DatabaseServer.getTopicById(newGoal.topicId);
    }

    notifier.completedAndStart('Save to IPFS & Hedera');
    const messageServer = new MessageServer(root.hederaAccountId, root.hederaAccountKey);
    const message = new GoalMessage(MessageAction.CreateGoal);
    message.setDocument(goalObject);
    await messageServer.setTopicObject(topic).sendMessage(message);

    notifier.completedAndStart('Update schema in DB');
    const savedGoal = await DatabaseServer.saveGoal(goalObject);
    notifier.completed();
    return savedGoal;
}

/**
 * Connect to the message broker methods of working with goals.
 *
 * @param channel - channel
 * @param apiGatewayChannel
 */
export async function goalAPI(channel: MessageBrokerChannel, apiGatewayChannel: MessageBrokerChannel): Promise<void> {
    /**
     * Return goals
     *
     * @param {Object} [payload] - filters
     *
     * @returns {IGoal[]} - all goals
     */
    ApiResponse(channel, MessageAPI.GET_GOALS, async (msg) => {
        try {
            if (!msg) {
                return new MessageError('Invalid load goals parameter');
            }

            const { did, pageIndex, pageSize, startDate, endDate } = msg;
            const filter: any = {
                where: {
                    userDid: did
                }
            }

            if (startDate) {
                filter.reportDateFrom = { $gte: new Date(startDate) };
            }

            if (endDate) {
                filter.reportDateTo = { $gte: new Date(endDate) };
            }

            const otherOptions: any = {};
            const _pageSize = parseInt(pageSize, 10);
            const _pageIndex = parseInt(pageIndex, 10);
            if (Number.isInteger(_pageSize) && Number.isInteger(_pageIndex)) {
                otherOptions.orderBy = { createDate: 'DESC' };
                otherOptions.limit = _pageSize;
                otherOptions.offset = _pageIndex * _pageSize;
            }

            const [goals, count] = await DatabaseServer.getGoalsAndCount(filter, otherOptions);

            return new MessageResponse({
                goals,
                count
            });
        } catch (error) {
            new Logger().error(error, ['GUARDIAN_SERVICE']);
            return new MessageError(error);
        }
    });

    /**
     * Create goal
     *
     * @param {IGoal} payload - goal
     *
     * @returns {IGoal[]} - all goals
     */
    ApiResponse(channel, MessageAPI.CREATE_GOAL, async (msg) => {
        try {
            const goalObject = msg as IGoal;
            const userDid = msg.userDid;
            await createGoal(goalObject, userDid, emptyNotifier());
            const goals = await DatabaseServer.getGoals({ where: { userDid }}, { limit: 100 });
            return new MessageResponse(goals);
        } catch (error) {
            new Logger().error(error, ['GUARDIAN_SERVICE']);
            return new MessageError(error);
        }
    });

    /**
     * Update goal
     *
     * @param {IGoal} payload - goal
     *
     * @returns {IGoal[]} - all goals
     */
    ApiResponse(channel, MessageAPI.UPDATE_GOAL, async (msg) => {
        try {
            const goalId = msg.id as string;
            const userDid = msg.userDid;
            const item = await DatabaseServer.getGoal({ where: { _id: goalId }});
            if (item) {
                item.comparisonDateFrom = msg.comparisonDateFrom;
                item.comparisonDateTo = msg.comparisonDateTo;
                item.reportDateFrom = msg.reportDateFrom;
                item.reportDateTo = msg.reportDateTo;
                item.comparisonEmissions = msg.comparisonEmissions;
                item.removal = msg.removal;
                item.reduction = msg.reduction;
                item.goalEmissions = msg.goalEmissions;
                item.totalRemoval = msg.totalRemoval;
                await DatabaseServer.updateGoal(goalId, item);
            }
            const goals = await DatabaseServer.getGoals({ where: { userDid }}, { limit: 100 });
            return new MessageResponse(goals);
        } catch (error) {
            new Logger().error(error, ['GUARDIAN_SERVICE']);
            return new MessageError(error);
        }
    });
}

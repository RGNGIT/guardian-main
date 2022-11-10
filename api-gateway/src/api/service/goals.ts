import { Guardians } from '@helpers/guardians';
import { Response, Router } from 'express';
import { AuthenticatedRequest, Logger } from '@guardian/common';

/**
 * Goals route
 */
export const goalAPI = Router();

goalAPI.get('/',  async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user = req.user;
        const guardians = new Guardians();
        let pageIndex: any;
        let pageSize: any;
        let startDate: any;
        let endDate: any;
        if (req.query) {
            if (req.query.pageIndex && req.query.pageSize) {
                pageIndex = req.query.pageIndex;
                pageSize = req.query.pageSize;
            }
            if (req.query.startDate) {
                startDate = req.query.startDate;
            }
            if (req.query.endDate) {
                endDate = req.query.endDate;
            }
        }
        const { goals, count } = await guardians.getGoals(user.did, pageIndex, pageSize, startDate, endDate);
        res.status(200).setHeader('X-Total-Count', count).json(goals);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: 500, message: error.message });
    }
});

goalAPI.post('/',  async (req: AuthenticatedRequest, res: Response) => {
    try {
        const goal = req.body;
        const guardians = new Guardians();

        const goals = await guardians.createGoal(goal);
        res.status(201).json(goals);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: 500, message: error.message });
    }
});

goalAPI.put('/',  async (req: AuthenticatedRequest, res: Response) => {
    try {
        const goal = req.body;
        const guardians = new Guardians();

        const goals = await guardians.updateGoal(goal);
        res.status(201).json(goals);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).json({ code: 500, message: error.message });
    }
});

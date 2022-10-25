import { Request, Response, Router } from 'express';
import { Guardians } from '@helpers/guardians';
import { Users } from '@helpers/users';
import { Logger } from '@guardian/common';
import { ResponseCode, formResponse } from '@helpers/response-manager';

/**
 * Dashboard route
 */
export const dashboardAPI = Router();

dashboardAPI.get('/devices/:policyId', async (req: Request, res: Response) => {
    const guardians = new Guardians();
    try {
        const policyId = req.params.policyId;
        const type = 'MRV';
        const documents = await guardians.getVcDocuments({policyId, type});
        
        // res.send('Dashboard works');
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(-1, error.message, ''));
    }
});
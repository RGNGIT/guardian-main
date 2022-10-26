import { Response, Router } from 'express';
import { Guardians } from '@helpers/guardians';
import { Logger, AuthenticatedRequest } from '@guardian/common';
import { ResponseCode, formResponse } from '@helpers/response-manager';

/**
 * Dashboard route
 */
export const dashboardAPI = Router();

dashboardAPI.get('/devices/:policyId', async (req: AuthenticatedRequest, res: Response) => {
    const guardians = new Guardians();
    try {
        const policyId = req.params.policyId;
        const type = req.query.type;
        let distinctDeviceIds: string[] = [];
        const records = await guardians.getVcDocuments({type, "document.credentialSubject.policyId": policyId});
        /*
        for(const record of records) {
            if(!distinctDeviceIds.includes(record['document']['issuer'] as string)) {

            }
        }
        */
        res.send(records);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(ResponseCode.GET_DASHBOARD_FAIL, error.message, 'GET_DASHBOARD_FAIL'));
    }
});
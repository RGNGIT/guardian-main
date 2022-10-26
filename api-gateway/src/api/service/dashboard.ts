import { Response, Router } from 'express';
import { Guardians } from '@helpers/guardians';
import { Logger, AuthenticatedRequest } from '@guardian/common';
import { ResponseCode, formResponse } from '@helpers/response-manager';

interface IDashboardDevice {
    deviceId: string;
    status: string;
    currentEmission: {value: string, trend: string};
    totalEmission: {value: string, trend: string};
}

let prevValues: IDashboardDevice[] = null;

function resolveDistinctDeviceIds(records): string[] {
    let temp: string[] = [];
    for(const record of records) {
        if(!temp.includes(record['document']['issuer'] as string)) {
            temp.push(record['document']['issuer'] as string);
        }
    }
    return temp;
}

function resolveDevices(records, distinctDeviceIds): IDashboardDevice[] {
    const temp: IDashboardDevice[] = [];
    for(const id of distinctDeviceIds) {
        temp.push({
            deviceId: id,
            status: null,
            currentEmission: {value: null, trend: null},
            totalEmission: {value: null, trend: null},
        });
        for(const record of records) {
            if(record['document']['issuer'] == id) {

            }
        }
    }
    return temp;
}

/**
 * Dashboard route
 */
export const dashboardAPI = Router();

dashboardAPI.get('/devices/:policyId', async (req: AuthenticatedRequest, res: Response) => {
    const guardians = new Guardians();
    try {
        const policyId = req.params.policyId;
        const type = req.query.type;
        const records = await guardians.getVcDocuments({type, "document.credentialSubject.policyId": policyId});
        const distinctDeviceIds = resolveDistinctDeviceIds(records);
        const devices = resolveDevices(records, distinctDeviceIds);
        prevValues = devices;
        res.json(devices);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(ResponseCode.GET_DASHBOARD_FAIL, error.message, 'GET_DASHBOARD_FAIL'));
    }
});
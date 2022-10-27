import { Response, Router } from 'express';
import { Guardians } from '@helpers/guardians';
import { Logger, AuthenticatedRequest } from '@guardian/common';
import { ResponseCode, formResponse } from '@helpers/response-manager';

enum EmissionTypes {
    CURRENT_EMISSION = 0,
    TOTAL_EMISSION = 1
};

interface IDashboardDevice {
    deviceId: string;
    status: string;
    currentEmission: {value: number, trend: string};
    totalEmission: {value: number, trend: string};
}

let prevDeviceValues: IDashboardDevice[] = null;

function resolveTrend(id, emissionType, value): string {
    if(!prevDeviceValues) return null;
    for(const device of prevDeviceValues) {
        if(device.deviceId === id) {
            switch(emissionType) {
                case EmissionTypes.CURRENT_EMISSION:
                    if(device.currentEmission == value) return 'still';
                    return device.currentEmission > value ? 'down' : 'up';
                case EmissionTypes.TOTAL_EMISSION:
                    if(device.totalEmission == value) return 'still';
                    return device.totalEmission > value ? 'down' : 'up';
            }
        }
    }
    return null;
}

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
            status: 'Active', // TODO: Resolve status
            currentEmission: {value: 0, trend: null},
            totalEmission: {value: 0, trend: null},
        });
        const item = temp[temp.length - 1];
        for(const record of records) {
            if(record['document']['issuer'] === id) {
                // TODO: Correct calculations
                item.currentEmission.value += Number(record['document']['credentialSubject']['field1']);
            }
        }
        item.currentEmission.trend = resolveTrend(item.deviceId, EmissionTypes.CURRENT_EMISSION, item.currentEmission.value);
        item.totalEmission.trend = resolveTrend(item.deviceId, EmissionTypes.TOTAL_EMISSION, item.totalEmission.value);
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
        prevDeviceValues = devices;
        res.json(devices);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(ResponseCode.GET_DASHBOARD_FAIL, error.message, 'GET_DASHBOARD_FAIL'));
    }
});
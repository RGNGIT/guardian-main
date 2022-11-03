import { Response, Router } from 'express';
import { Guardians } from '@helpers/guardians';
import { Logger, AuthenticatedRequest } from '@guardian/common';
import { ResponseCode, formResponse } from '@helpers/response-manager';
import { Users } from '@helpers/users';
import { IVCDocument } from '@guardian/interfaces';
import { Temporal } from '@js-temporal/polyfill';

enum StatusType {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive'
};

enum EmissionType {
    CURRENT_EMISSION = 0,
    TOTAL_EMISSION = 1
};

enum TrendType {
    UP = 'up',
    DOWN = 'down',
    STILL = 'still'
};

interface IDashboardDevice {
    deviceId: string;
    deviceName: string;
    status: string;
    currentEmission: {value: number, trend: string};
    totalEmission: {value: number, trend: string};
}

interface ITokenMeta {
    todayAmount: number;
    periodAmount: number;
    totalAmount: number;
}

class TokensData {
    todayCETValue: number;
    todayCRUValue: number;
    totalCETValue: number;
    totalCRUValue: number;
    periodCETValue: number;
    periodCRUValue: number;
    CETOfAllPercent: number;
    CRUOfAllPercent: number;

    calculatePercents() {
        const formula = (x, y) => {
            return Math.round((x / y) * 100);
        };
        this.CETOfAllPercent = formula(this.periodCETValue, this.totalCETValue);
        this.CRUOfAllPercent = formula(this.periodCRUValue, this.totalCRUValue);
    }

}

// Tokens Logic
// TODO: Adjusting for actual policy
async function fetchTokens(records: IVCDocument[], period): Promise<TokensData> {
    const tokenTypes = ['CET', 'CRU'];
    const tokensData = new TokensData();
    const todayDate = new Date(Date.now()).toISOString();
    // Token (type)
    const fetchTokens = (type: string): ITokenMeta => {
        let temp = {
            todayAmount: 0,
            periodAmount: 0,
            totalAmount: 0
        }
        for(const record of records) {
            if(record['document']['credentialSubject'][0]['type'] == type) {
                // If today
                // If within period
                // If always
            }
        }
        return temp;
    }
    for(const tokenType of tokenTypes) {
        const meta = fetchTokens(tokenType);
        tokensData[`today${tokenType}Value`] = meta.todayAmount;
        tokensData[`period${tokenType}Value`] = meta.periodAmount;
        tokensData[`total${tokenType}Value`] = meta.totalAmount;
    }
    tokensData.calculatePercents();
    return tokensData;
}

// Devices Logic

let prevDeviceValues: IDashboardDevice[] = null;

async function resolveDeviceName(did: string): Promise<string | null> {
    const users = new Users();
    const device = await users.getUserById(did);
    return device ? device.username : null;
}

function resolveTrend(id: string, emissionType: number, value: number): string {
    if(!prevDeviceValues) return TrendType.STILL;
    for(const device of prevDeviceValues) {
        if(device.deviceId === id) {
            switch(emissionType) {
                case EmissionType.CURRENT_EMISSION:
                    if(device.currentEmission.value == value) return TrendType.STILL;
                    return device.currentEmission.value > value ? TrendType.DOWN : TrendType.UP;
                case EmissionType.TOTAL_EMISSION:
                    if(device.totalEmission.value == value) return TrendType.STILL;
                    return device.totalEmission.value > value ? TrendType.DOWN : TrendType.UP;
                default: break;
            }
        }
    }
    return TrendType.STILL;
}

function resolveDistinctDeviceIDs(records: IVCDocument[]): string[] {
    let temp: string[] = [];
    for(const record of records) {
        if(!temp.includes(record['document']['issuer'] as string)) {
            temp.push(record['document']['issuer'] as string);
        }
    }
    return temp;
}
// Sort from latest to oldest
function sortByDate(records: IVCDocument[]): IVCDocument[] {
    return records.sort((recordA, recordB) => { 
        return Number(new Date(recordB.document.issuanceDate)) - Number(new Date(recordA.document.issuanceDate))
    });
}
// TODO: Adjusting for actual policy
async function resolveDeviceList(records: IVCDocument[], distinctDeviceIds: string[]): Promise<IDashboardDevice[]> {
    const temp: IDashboardDevice[] = [];
    for(const id of distinctDeviceIds) {
        temp.push({
            deviceId: id,
            deviceName: await resolveDeviceName(id),
            status: StatusType.ACTIVE, // TODO: Resolve status
            currentEmission: {value: 0, trend: null},
            totalEmission: {value: 0, trend: null},
        });
        const item = temp[temp.length - 1];
        for(const record of records) {
            if(record['document']['issuer'] === id) {
                // P15M
                // TODO: Correct calculations by dates
                item.currentEmission.value += Number(record['document']['credentialSubject'][0]['field1']);
            }
        }
        item.currentEmission.trend = resolveTrend(item.deviceId, EmissionType.CURRENT_EMISSION, item.currentEmission.value);
        item.totalEmission.trend = resolveTrend(item.deviceId, EmissionType.TOTAL_EMISSION, item.totalEmission.value);
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
        let records = await guardians.getVcDocuments({type, "document.credentialSubject.policyId": policyId});
        records = sortByDate(records);
        const distinctDeviceIds = resolveDistinctDeviceIDs(records);
        const devices = await resolveDeviceList(records, distinctDeviceIds);
        prevDeviceValues = devices;
        res.json(devices);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(ResponseCode.GET_DASHBOARD_FAIL, error.message, 'GET_DASHBOARD_FAIL'));
    }
});

dashboardAPI.get('/tokens/:policyId', async (req: AuthenticatedRequest, res: Response) => {
    const guardians = new Guardians();
    try {
        const policyId = req.params.policyId;
        const type = req.query.type;
        const period = req.query.period;
        const records = await guardians.getVcDocuments({type, policyId});
        const tokens = await fetchTokens(records, period);
        res.json(tokens);
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(ResponseCode.GET_DASHBOARD_FAIL, error.message, 'GET_DASHBOARD_FAIL'));
    }
});
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
    emissionDateTime: Date;
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
        const f = (x: number, y: number): number => {
            return Math.round((x / y) * 100);
        };
        this.CETOfAllPercent = f(this.periodCETValue, this.totalCETValue);
        this.CRUOfAllPercent = f(this.periodCRUValue, this.totalCRUValue);
    }

}
// Some date works
const isToday = (date1: Temporal.PlainDateTime, date2: Temporal.PlainDateTime): boolean => {
    return date1.year === date2.year && date1.month === date2.month && date1.day === date2.day;
};

const isWithinPeriod = (dateToCheck: Temporal.PlainDateTime, from: Temporal.PlainDateTime, to: Temporal.PlainDateTime): boolean => {
    const check = (what: string): boolean => {
        return ((dateToCheck[what] >= from[what] && dateToCheck[what] <= to[what]) || (dateToCheck[what] === from[what] && from[what] === to[what]));
    };
    return check('year') && check('month') && check('day');
};

const isCurrentYearQuarter = (emissionDate): boolean => {
    const today = new Date();
    const eDate = new Date(emissionDate);
    const currentQuarter = Math.floor((today.getMonth() + 3) / 3);
    const eQuarter = Math.floor((eDate.getMonth() + 3) / 3);
    return currentQuarter == eQuarter;
};

const isLastFifteenMin = (emissionDate): boolean => {
    const eDate = Temporal.PlainDateTime.from(emissionDate);
    const todayDate = Temporal.PlainDateTime.from(new Date(Date.now()).toISOString().split('.')[0]);
    return eDate.until(todayDate).years == 0 && eDate.until(todayDate).days == 0 && eDate.until(todayDate).minutes <= 15;
}

// Tokens Logic
// TODO: Adjusting for actual policy
async function fetchTokens(records: IVCDocument[], period: {from, to}): Promise<TokensData> {
    const tokenTypes = ['CET', 'CRU'];
    const tokensData = new TokensData();
    const todayDateISO = new Date(Date.now()).toISOString().split('.')[0];
    const todayDate = Temporal.PlainDateTime.from(todayDateISO);
    period.from = Temporal.PlainDateTime.from(period.from);
    period.to = Temporal.PlainDateTime.from(period.to);
    // Token (type)
    const fetchTokensCount = (type: string): ITokenMeta => {
        let temp = {
            todayAmount: 0,
            periodAmount: 0,
            totalAmount: 0
        }
        for(const record of records) {
            if(record['document']['credentialSubject'][0]['type'] == type) {
                const issuanceDate = Temporal.PlainDateTime.from(record['document']['issuanceDate']);
                // If today
                if(isToday(issuanceDate, todayDate)) {
                    temp.todayAmount++;
                }
                // If within period
                if(isWithinPeriod(issuanceDate, period.from, period.to)) {
                    temp.periodAmount++;
                }
                // If always
                temp.totalAmount++;
            }
        }
        return temp;
    }
    for(const tokenType of tokenTypes) {
        const tokensCount = fetchTokensCount(tokenType);
        tokensData[`today${tokenType}Value`] = tokensCount.todayAmount;
        tokensData[`period${tokenType}Value`] = tokensCount.periodAmount;
        tokensData[`total${tokenType}Value`] = tokensCount.totalAmount;
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
            emissionDateTime: null,
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
                // Emission from the last 15 min block
                if(isLastFifteenMin(record['document']['credentialSubject'][0]['field0'])) {
                    item.currentEmission.value += Number(record['document']['credentialSubject'][0]['field1']);
                }
                // This year's quarter emission
                if(isCurrentYearQuarter(record['document']['credentialSubject'][0]['field0'])) {
                    item.totalEmission.value += Number(record['document']['credentialSubject'][0]['field1']);   
                }
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
        res.json(formResponse(ResponseCode.GET_DASHBOARD_SUCCESS, devices, 'GET_DASHBOARD_SUCCESS'));
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
        const from = req.query.from;
        const to = req.query.to;
        const records = await guardians.getVcDocuments({type, policyId});
        const tokens = await fetchTokens(records, {from, to});
        res.json(formResponse(ResponseCode.GET_DASHBOARD_SUCCESS, tokens, 'GET_DASHBOARD_SUCCESS'));
    } catch (error) {
        new Logger().error(error, ['API_GATEWAY']);
        res.status(500).send(formResponse(ResponseCode.GET_DASHBOARD_FAIL, error.message, 'GET_DASHBOARD_FAIL'));
    }
});
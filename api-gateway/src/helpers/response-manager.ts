interface IHTTPCodeResponse {
    code: number;
    alias?: string;
    message: any;
}

export enum ResponseCode {
    REGISTRATION_QUEUE_UPDATED = 0,
    REGISTRATION_CONFIRMED = 1,
    REGISTRATION_CONFIRMATION_WRONG_LINK = 2,
    LOGIN_SUCCESS = 3,
    LOGIN_FAIL = 4,
    RESET_PASSWORD_USER_NOT_FOUND = 5,
    RESET_PASSWORD_QUEUE_UPDATED = 6,
    RESET_PASSWORD_UPDATED = 7,
    RESET_PASSWORD_WRONG_LINK = 8,
    USER_EXISTS = 9,
    SESSION_GET_SUCCESS = 10,
    SESSION_GET_FAIL = 11,
    GET_ALL_USERS_SUCCESS = 12,
    GET_ALL_USERS_FAIL = 13,
    GET_STANDARD_REGISTRY_SUCCESS = 14,
    GET_STANDARD_REGISTRY_FAIL = 15,
    GET_BALANCE_SUCCESS = 16,
    GET_BALANCE_FAIL = 17
}
/**
 * Forms respond JSON
* @param {number} code Code of the action
* @param {any} message Message to send
* @param {string} alias Alias of the code (optional)
* @returns {IHTTPCodeResponse} Formed JSON
*/
export function formResponse(code: number, message: any, alias?: string): IHTTPCodeResponse {
    return {code, alias: alias ? alias : null, message} as IHTTPCodeResponse;
}

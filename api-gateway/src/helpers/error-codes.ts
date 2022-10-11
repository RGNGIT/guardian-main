export interface HTTPCodeResponse {
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
    USER_EXISTS = 9
}
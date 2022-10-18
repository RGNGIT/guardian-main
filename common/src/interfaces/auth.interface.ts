import { Request } from 'express';
import WebSocket from 'ws';
import { UserRole } from '@guardian/interfaces';

/**
 * Pending confirmation user interface
 */
export interface IUserUpdatePassword {
    /**
     * User account email
     */
    email: string;
    /**
     * User account check sum
     */
    checkSum: string;
}

/**
 * Pending confirmation user interface
 */
export interface IPendingUser {
    /**
     * First name of user
     */
    first_name: string;
    /**
     * Last name of user
     */
    last_name: string;
    /**
     * User account name
     */
    username: string;
    /**
     * User account password
     */
    password: string;
    /**
     * User account role
     */
    role: string;
    /**
     * User account email
     */
    email: string;
    /**
     * User account check sum
     */
    checkSum: string;
}

/**
 * Authenticated user interface
 */
export interface IAuthUser {
    /**
     * First name of user
     */
    first_name: string;

    /**
     * Last name of user
     */
    last_name: string;
    /**
     * User account name
     */
    username: string;
    /**
     * User role
     */
    role: UserRole;
    /**
     * User DID
     */
    did?: string;
    /**
     * Parent user DID
     */
    parent?: string;
    /**
     * Hedera account id
     */
    hederaAccountId?: string;
    /**
     * Wallet token
     */
    walletToken?: string;
    /**
     * User account email
     */
    email: string;
}

/**
 * Request additional fields
 */
interface AdditionalFields {
    /**
     * Associated user
     */
    user: IAuthUser
}

/**
 * Authenticated request
 */
export type AuthenticatedRequest = Request & AdditionalFields;
/**
 * Authenticated websocket
 */
export type AuthenticatedWebSocket = WebSocket & AdditionalFields;

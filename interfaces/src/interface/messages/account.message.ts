import { UserRole } from '../../type/user-role.type';
import { IUser } from '../user.interface';

/**
 * Get user message interface
 */
export interface IGetUserMessage {
    /**
     * Username
     */
    username: string;
}

/**
 * Get user by email interface
 */
export interface IGetUserByEmailMessage {
    /**
     * Email
     */
    email: string;
}

/**
 * Get user by token message
 */
export interface IGetUserByTokenMessage {
    /**
     * Token id
     */
    token: string;
}

/**
 * Register new user message interface
 */
export interface IRegisterNewUserMessage {
    /**
     * User's first name
     */
    first_name: string;
    /**
     * User's last name
     */
    last_name: string;
    /**
     * Username
     */
    username: string;
    /**
     * Password
     */
    password: string;
    /**
     * Role
     */
    role: UserRole;
    /**
     * Email
     */
    email: string;
}

/**
 * Generate token message interface
 */
export interface IGenerateTokenMessage {
    /**
     * Username
     */
    email: string;
    /**
     * Password
     */
    password: string;
}

/**
 * Generate token response interface
 */
export interface IGenerateTokenResponse {
    /**
     * Username
     */
    username: string;
    /**
     * Access token
     */
    accessToken: string;
    /**
     * User role
     */
    role: UserRole;
    /**
     * User did
     */
    did: string;
}

/**
 * Get all users response interface
 */
export interface IGetAllUserResponse {
    /**
     * Username
     */
    username: string;
    /**
     * Parent user
     */
    parent: string;
    /**
     * User did
     */
    did: string;
}

/**
 * Standard Registry user response interface
 */
export interface IStandardRegistryUserResponse {
    /**
     * Username
     */
    username: string;
    /**
     * User did
     */
    did: string;
}

/**
 * Get demo user response interface
 */
export interface IGetDemoUserResponse extends IGetAllUserResponse {
    /**
     * User role
     */
    role: UserRole;
}

/**
 * Update user message interface
 */
export interface IUpdateUserMessage {
    /**
     * Username
     */
    username: string;
    /**
     * User update fields
     */
    item: Partial<IUser>;
}

/**
 * Update user password interface
 */
export interface IUpdateUserPasswordMessage {
    /**
     * Email
     */
    email: string;
    /**
     * User password
     */
    password: string;
}

/**
 * Save user message interface
 */
export interface ISaveUserMessage {
    /**
     * User instance
     */
    user: IUser;
}

/**
 * Get user by id message interface
 */
export interface IGetUserByIdMessage {
    /**
     * User did
     */
    did: string;
}
/**
 * Get user by id enail
 */
 export interface IGetUserByEmail {
    /**
     * User email
     */
    email: string;
}
/**
 * Get users by ids message interface
 */
export interface IGetUsersByIdMessage {
    /**
     * Users dids
     */
    dids: string[];
}

/**
 * Get users by role message interface
 */
export interface IGetUsersByIRoleMessage {
    /**
     * Users role
     */
    role: UserRole;
}

/**
 * Get users by account message interface
 */
export interface IGetUsersByAccountMessage {
    /**
     * Account
     */
    account: string;
}

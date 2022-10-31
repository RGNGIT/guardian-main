import {BaseResponse} from "@app/models/base-response";
import {USER_ROLES} from "@app/enums/user-roles";

export interface IAuthUser {
  username: string,
  did: string,
  role: USER_ROLES,
  accessToken: string
}

export type AuthUserResponse = BaseResponse<IAuthUser, any>

export interface IUserProfile {
  confirmed: boolean;
  did: string;
  didDocument: string;
  failed: boolean;
  hederaAccountId: string;
  hederaAccountKey: string;
  parent: string;
  parentTopicId: string;
  role: USER_ROLES;
  topicId: string;
  username: string
  vcDocument: string;
}

export interface IStandardRegistryAccount {
  did: string;
  username: string;
}
export type IStandardRegistryAccountResponse = BaseResponse<IStandardRegistryAccount[], any>


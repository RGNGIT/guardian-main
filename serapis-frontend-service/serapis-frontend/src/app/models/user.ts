import {BaseResponse} from "@app/models/base-response";

export interface AuthUser {
  username: string,
  did: string,
  role: string,
  accessToken: string
}

export type AuthUserResponse = BaseResponse<AuthUser, any>

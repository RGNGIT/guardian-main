import {USER_CONFIRMATION_STATE} from "../enum/user";
import {BaseResponse} from "@app/models/base-response";

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface PasswordReset {
  email: string;
}

export interface ConfirmUserRequest {
  c: string;
  u: string;
}

export interface PasswordChangeRequest extends ConfirmUserRequest {
  password: string;
}

export interface ConfirmUser {
  "_id": string,
  "first_name": string,
  "last_name": string,
  "username": string,
  "password": string,
  "email": string,
  "did": string,
  "parent": string,
  "walletToken": string,
  "role": string,
  "id": string
}

export type ConfirmUserResponse = BaseResponse<ConfirmUser, USER_CONFIRMATION_STATE>;

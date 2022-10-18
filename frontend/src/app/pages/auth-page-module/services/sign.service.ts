import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {
  ConfirmUser,
  ConfirmUserRequest,
  ConfirmUserResponse,
  PasswordChangeRequest,
  PasswordReset,
  RegisterUserRequest
} from "../model/user";
import {Observable} from "rxjs";
import {API_URLS} from "@app/constants/api";
import {AuthUserResponse} from "@app/models/user";
import {BaseResponse} from "@app/models/base-response";

@Injectable()
export class SignService {

  constructor(private _http: HttpClient) {

  }

  public registerUser(user: RegisterUserRequest): Observable<BaseResponse<unknown, unknown>> {
    return this._http.post<BaseResponse<unknown, unknown>>(API_URLS.auth.register, user);
  }

  public signIn(user: RegisterUserRequest): Observable<AuthUserResponse> {
    return this._http.post<AuthUserResponse>(API_URLS.auth.login, user);
  }

  public passwordReset(data: PasswordReset): Observable<BaseResponse<unknown, unknown>> {
    return this._http.post<BaseResponse<unknown, unknown>>(API_URLS.auth.passwordReset, data);
  }

  public passwordChange(data: PasswordChangeRequest) {
    let params = new HttpParams()
      .append('c', data.c)
      .append('u', data.u);
    return this._http.post<BaseResponse<unknown, unknown>>(API_URLS.auth.passwordChange, {password: data.password}, { params });
  }

  public confirmUser(user: ConfirmUserRequest): Observable<ConfirmUserResponse> {
    let params = new HttpParams()
      .append('c', user.c)
      .append('u', user.u);

    return this._http.get<ConfirmUserResponse>(API_URLS.auth.confirm, { params })
  }

}


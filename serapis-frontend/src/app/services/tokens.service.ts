import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {IToken, ITokenInfo} from "@app/models/token";
import {API_URLS} from "@app/constants/api";
import {IPushResponse} from "@app/models/async";

@Injectable({
  providedIn: 'root'
})
export class TokensService {

  constructor (private _http: HttpClient) {

  }

  public create(data: any): Observable<IToken[]> {
    return this._http.post<IToken[]>(API_URLS.tokens.base, data);
  }

  public pushCreate(data: any): Observable<IPushResponse> {
    return this._http.post<IPushResponse>(API_URLS.tokens.pushCreate, data);
  }

  public getTokens(policyId?: string): Observable<ITokenInfo[]> {
    if (policyId) {
      return this._http.get<ITokenInfo[]>(`${API_URLS.tokens.base}?policy=${policyId}`);
    }
    return this._http.get<ITokenInfo[]>(API_URLS.tokens.base);
  }

  public associate(tokenId: string, associate: boolean): Observable<void> {
    const url = associate ? API_URLS.tokens.associate : API_URLS.tokens.dissociate;
    return this._http.put<void>(url.replace('{tokenId}', tokenId), null);
  }

  public pushAssociate(tokenId: string, associate: boolean): Observable<IPushResponse> {
    const url = associate ? API_URLS.tokens.associatePush : API_URLS.tokens.dissociatePush;
    return this._http.put<IPushResponse>(url.replace('{tokenId}', tokenId), null);
  }

  public kyc(tokenId: string, username: string, kyc: boolean): Observable<void> {
    const url = kyc ? API_URLS.tokens.grantKyc : API_URLS.tokens.revokeKyc;
    return this._http.put<void>(this.replaceUrl(url, tokenId, username),null);
  }

  private replaceUrl(url: string, tokenId?: string, username?: string) {
    if (tokenId) {
      url = url.replace('{tokenId}', tokenId)
    }
    if (username) {
      url = url.replace('{username}', username)
    }
    return url;
  }

  public pushKyc(tokenId: string, username: string, kyc: boolean): Observable<IPushResponse> {
    const url = kyc ? API_URLS.tokens.grantPushKyc : API_URLS.tokens.revokePushKyc;
    return this._http.put<IPushResponse>(this.replaceUrl(url, tokenId, username),null);
  };

  public freeze(tokenId: string, username: string, freeze: boolean): Observable<void> {
    const url = freeze ? API_URLS.tokens.freeze : API_URLS.tokens.unfreeze;
    return this._http.put<void>(this.replaceUrl(url, tokenId, username),null);
  }

  public info(tokenId: string, username: string): Observable<ITokenInfo> {
    return this._http.get<ITokenInfo>(this.replaceUrl(API_URLS.tokens.info, tokenId, username));
  }
}

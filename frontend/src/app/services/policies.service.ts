import {Injectable} from "@angular/core";
import {Page} from "@app/models/page";
import {HttpClient, HttpParams} from "@angular/common/http";
import {API_URLS} from "@app/constants/api";
import {IPolicy} from "@app/models/policy";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PoliciesService {

  constructor(private _http: HttpClient) {
  }

  public getPolicies(page: Page): Observable<IPolicy[]> {
    // todo change it
    const httpParams = new HttpParams()
      .append('pageIndex', page.page)
      .append('pageSize', page.size)
    const params = { params: httpParams };
   return this._http.get<IPolicy[]>(API_URLS.policies.base, params)
  }

  public pushCreate(policy: any): Observable<{ taskId: string, expectation: number }> {
    return this._http.post<{ taskId: string, expectation: number }>(API_URLS.policies.push, policy);
  }
}

import {Injectable} from "@angular/core";
import {Page} from "@app/models/page";
import {HttpClient, HttpParams} from "@angular/common/http";
import {API_URLS} from "@app/constants/api";
import {IPolicy, IPolicyUploadPreview} from "@app/models/policy";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PoliciesService {

  constructor(private _http: HttpClient) {
  }

  public all(): Observable<any[]> {
    return this._http.get<any[]>(`${API_URLS.policies.base}/`);
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

  public previewByFile(policyFile: any): Observable<IPolicyUploadPreview> {
    return this._http.post<IPolicyUploadPreview>(API_URLS.policies.importFile, policyFile, {
      headers: {
        'Content-Type': 'binary/octet-stream'
      }
    });
  }

  public dryRun(policyId: string): Observable<any> {
    return this._http.put<any>(API_URLS.policies.dryRun.replace('{policyId}', policyId), null);
  }

  public draft(policyId: string): Observable<any> {
    return this._http.put<any>(API_URLS.policies.draft.replace('{policyId}', policyId), null);
  }

  public pushDelete(policyId: string): Observable<{ taskId: string, expectation: number }> {
    return this._http.delete<{ taskId: string, expectation: number }>(
      API_URLS.policies.pushDelete.replace('{policyId}', policyId)
    );
  }

  public pushPublish(policyId: string, policyVersion: string): Observable<{ taskId: string, expectation: number }> {
    return this._http.put<{ taskId: string, expectation: number }>(
      API_URLS.policies.setActive.replace('{policyId}', policyId),
      { policyVersion }
    );
  }

  public pushImportByFile(policyFile: any, versionOfTopicId?: string): Observable<{ taskId: string, expectation: number }> {
    let httpParams = new HttpParams();
    if (versionOfTopicId) {
      httpParams = httpParams.append('versionOfTopicId', versionOfTopicId);
    }
    return this._http.post<{ taskId: string, expectation: number }>(
      API_URLS.policies.pushFile,
      policyFile,
      {
        params: httpParams,
        headers: {
          'Content-Type': 'binary/octet-stream'
        }
    });
  }

  public pushPreviewByMessage(messageId: string): Observable<{ taskId: string, expectation: number }> {
    return this._http.post<{ taskId: string, expectation: number }>(API_URLS.policies.pushIPFS, { messageId });
  }

  public pushImportByMessage(messageId: string, versionOfTopicId?: string): Observable<{ taskId: string, expectation: number }> {
    let httpParams = new HttpParams();
    if (versionOfTopicId) {
      httpParams = httpParams.append('versionOfTopicId', versionOfTopicId);
    }
    return this._http.post<{ taskId: string, expectation: number }>(API_URLS.policies.pushMessage, { messageId }, {params: httpParams});
  }
}

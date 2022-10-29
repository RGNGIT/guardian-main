import {Injectable} from "@angular/core";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {EMPTY, Observable} from "rxjs";
import {API_URLS} from "@app/constants/api";
import {ISchema, Schema} from "@app/models/schema";
import {AuthService} from "@app/services/auth.service";
import {UserService} from "@app/services/user.service";

@Injectable({
  providedIn: 'root'
})
export class SchemasService {

  url = API_URLS.schemas.allSchemas;

  constructor(private _http: HttpClient, private  userService: UserService) {

  }

  public getSystemSchemas(pageIndex?: number, pageSize?: number): Observable<HttpResponse<ISchema[]>> {
    // @ts-ignore
    const username = encodeURIComponent(this.userService.getUser().username);
    let url = `${this.url}/system/${username}`;
    if (Number.isInteger(pageIndex) && Number.isInteger(pageSize)) {
      url += `?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    }
    return this._http.get<any>(url, { observe: 'response' });
  }

  public getSchemasByPage(topicId?: string, pageIndex?: number, pageSize?: number): Observable<HttpResponse<ISchema[]>> {
    let url = `${this.url}`;
    if (topicId) {
      url += `/${topicId}`
    }
    if (Number.isInteger(pageIndex) && Number.isInteger(pageSize)) {
      url += `?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    }
    return this._http.get<any>(url, { observe: 'response' });
  }

  public createSystemSchemas(schema: Schema): Observable<ISchema> {
    // @ts-ignore
    const username = encodeURIComponent(this.userService.getUser().username);
    return this._http.post<any>(`${this.url}/system/${username}`, schema);
  }

  public pushCreate(schema: Schema, topicId: any): Observable<{ taskId: string, expectation: number }> {
    return this._http.post<{ taskId: string, expectation: number }>(`${this.url}/push/${topicId}`, schema);
  }

  public getEntityByName(name: string): Observable<ISchema> {
    if (!name) return EMPTY;
    return this._http.get<ISchema>(API_URLS.schemas.entity.replace('{entityName}', name));
  }

  public pushPublish(id: string, version: string): Observable<{ taskId: string, expectation: number }> {
    return this._http.put<{ taskId: string, expectation: number }>(`${this.url}/push/${id}/publish`, { version });
  }

  public activeSystemSchemas(id: string): Observable<any> {
    return this._http.put<any>(`${this.url}/system/${id}/active`, null);
  }

  public updateSystemSchemas(schema: Schema, id?: string): Observable<ISchema[]> {
    const data = Object.assign({}, schema, { id: id || schema.id });
    return this._http.put<any[]>(`${this.url}/system/${id}`, data);
  }

  public update(schema: Schema, id?: string): Observable<ISchema[]> {
    const data = Object.assign({}, schema, { id: id || schema.id });
    return this._http.put<any[]>(`${this.url}`, data);
  }

  public newVersion(schema: Schema, id?: string): Observable<{ taskId: string, expectation: number }> {
    const data = Object.assign({}, schema, { id: id || schema.id });
    return this._http.post<{ taskId: string, expectation: number }>(`${this.url}/push/${data.topicId}`, data);
  }

  public deleteSystemSchemas(id: string): Observable<any> {
    return this._http.delete<any>(`${this.url}/system/${id}`);
  }

  public delete(id: string): Observable<ISchema[]> {
    return this._http.delete<any[]>(`${this.url}/${id}`);
  }

  public pushImportByMessage(messageId: string, topicId: any): Observable<{ taskId: string, expectation: number }> {
    return this._http.post<{ taskId: string, expectation: number }>(`${this.url}/push/${topicId}/import/message`, { messageId });
  }

  public pushImportByFile(schemasFile: any, topicId: any): Observable<{ taskId: string, expectation: number }> {
    return this._http.post<{ taskId: string, expectation: number }>(`${this.url}/push/${topicId}/import/file`, schemasFile, {
      headers: {
        'Content-Type': 'binary/octet-stream'
      }
    });
  }

  public exportInMessage(id: string): Observable<ISchema[]> {
    return this._http.get<any[]>(`${this.url}/${id}/export/message`);
  }

  public exportInFile(id: string): Observable<ArrayBuffer> {
    return this._http.get(`${this.url}/${id}/export/file`, {
      responseType: 'arraybuffer'
    });
  }

  public pushPreviewByMessage(messageId: any): Observable<{ taskId: string, expectation: number }> {
    return this._http.post<{ taskId: string, expectation: number }>(`${this.url}/push/import/message/preview`, { messageId });
  }

  public previewByFile(schemasFile: any): Observable<ISchema[]> {
    return this._http.post<any[]>(`${this.url}/import/file/preview`, schemasFile, {
      headers: {
        'Content-Type': 'binary/octet-stream'
      }
    });
  }

  public getSchemasByType(type: string): Observable<ISchema> {
    return this._http.get<ISchema>(`${this.url}/type/${type}`);
  }
}

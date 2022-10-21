import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {EMPTY, Observable} from "rxjs";
import {API_URLS} from "@app/constants/api";
import {ISchema} from "@app/models/schema";

@Injectable({
  providedIn: 'root'
})
export class SchemasService {

  constructor(private _http: HttpClient) {

  }

  public getAllSchemas(): any {
    return this._http.get(API_URLS.schemas.allSchemas);
  }

  public getEntityByName(name: string): Observable<ISchema> {
    if (!name) return EMPTY;
    return this._http.get<ISchema>(API_URLS.schemas.entity.replace('{entityName}', name));
  }
}

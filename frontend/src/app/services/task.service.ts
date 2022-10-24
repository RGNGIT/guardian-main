import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

export const API_VERSION = 'v1';
export const API_BASE_URL = `/api/${API_VERSION}`;

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly url: string = `/tasks`;

  constructor(private http: HttpClient) {
  }

  public get(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.url}/${taskId}`);
  }
}

import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {API_URLS} from "@app/constants/api";

@Injectable({
  providedIn: 'root'
})
export class TasksService {


  constructor(private http: HttpClient) {
  }

  public get(taskId: string): Observable<any> {
    return this.http.get<any>(`${API_URLS.tasks.base}/${taskId}`);
  }
}

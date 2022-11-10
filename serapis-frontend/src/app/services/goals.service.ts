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
export class GoalsService {

  url = API_URLS.goals.base;

  constructor(private _http: HttpClient, private  userService: UserService) {

  }

  public getGoalsList(pageIndex?: number, pageSize?: number): Observable<HttpResponse<any[]>> {
    let url = this.url;
    if (Number.isInteger(pageIndex) && Number.isInteger(pageSize)) {
      url += `?pageIndex=${pageIndex}&pageSize=${pageSize}`;
    }
    return this._http.get<any>(url, { observe: 'response' });
  }

  public addNewGoal(goal: any) {
    return this._http.post<any>(this.url, goal);
  }

  public updateGoal(goal: any): Observable<any[]> {
    return this._http.put<any[]>(this.url, goal);
  }

}

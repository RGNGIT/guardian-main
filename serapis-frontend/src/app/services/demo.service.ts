import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { API_URLS } from "@app/constants/api";

@Injectable({
  providedIn: "root"
})
export class DemoService {
  constructor( private http: HttpClient ) {
  }

  public getRandomKey(): Observable<any> {
    return this.http.get<any>(API_URLS.demo.random);
  }

  public pushGetRandomKey(): Observable<{ taskId: string, expectation: number }> {
    return this.http.get<{ taskId: string, expectation: number }>(API_URLS.demo.pushRandom);
  }

}

import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class DemoService {
  private readonly url: string = `/demo`;
  constructor(
    private http: HttpClient
  ) {
  }

  public getRandomKey(): Observable<any> {
    return this.http.get<any>(`${this.url}/randomKey`);
  }

  public pushGetRandomKey(): Observable<{ taskId: string, expectation: number }> {
    return this.http.get<{ taskId: string, expectation: number }>(`${this.url}/push/randomKey`);
  }

}

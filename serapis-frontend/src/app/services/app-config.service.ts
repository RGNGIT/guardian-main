import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {catchError, take, throwError} from "rxjs";

@UntilDestroy()
@Injectable({ providedIn: 'root' })
export class AppConfigService {
  data: any = {};

  constructor(private http: HttpClient) {}

  load(defaults?: {}): Promise<{}> {
    return new Promise<{}>((resolve) => {
      this.http
        .get('/assets/config/app.config.json')
        .pipe(
          take(1),
          untilDestroyed(this),
          catchError((err) => {
            this.data = Object.assign({}, defaults || {});
            resolve(this.data);
            return throwError(() => err);
          }),
        )
        .subscribe((response) => {
          this.data = Object.assign({}, defaults || {}, response || {});
          resolve(this.data);
        });
    });
  }

  getProperty(name: string): any {
    return this.data[name];
  }
}

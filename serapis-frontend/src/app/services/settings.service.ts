import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BASE_API } from '@app/constants/api';
/**
 * Services for working from user profile.
 */
@Injectable()
export class SettingsService {
  private readonly url: string = `${BASE_API}/settings`;

  private hederaNetSubject = new BehaviorSubject<string>('');
  private hederaNet = this.hederaNetSubject
    .asObservable()
    .pipe(filter(res => !!res));

  constructor(private http: HttpClient) {
    this.getRemoteHederaNet().subscribe(res => {
      this.hederaNetSubject.next(res);
    });
  }

  public getHederaNet(): Observable<string> {
    return this.hederaNet;
  }

  private getRemoteHederaNet(): Observable<string> {
    return this.http.get(`${this.url}/environment`, {
      responseType: 'text'
    });
  }
}

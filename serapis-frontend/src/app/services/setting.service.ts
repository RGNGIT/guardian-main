import {Injectable} from "@angular/core";
import {BehaviorSubject, filter, lastValueFrom, Observable, withLatestFrom} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "@app/constants/api";
import {CommonSettings} from "@app/models/common-setting";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly url: string = API_URLS.config;

  public readonly hederaNetSubject = new BehaviorSubject<string>('');
  private hederaNet = this.hederaNetSubject
    .asObservable()
    .pipe(filter((res) => !!res));

  constructor(private http: HttpClient) {
    this.getRemoteHederaNet().subscribe((res) => {
      this.hederaNetSubject.next(res);
    });
  }

  public updateSettings(settings: CommonSettings): Observable<void> {
    return this.http.post<void>(`${this.url}`, settings);
  }

  public getSettings(): Observable<CommonSettings> {
    return this.http.get<CommonSettings>(`${this.url}`);
  }

  public getHederaNet(): Observable<string> {
    return this.hederaNet;
  }

  private getRemoteHederaNet(): Observable<string> {
    return this.http.get(`${this.url}/environment`, {
      responseType: 'text',
    });
  }

  getHederaUrl(type: string, params: string): string {
    let url = '';
    const res = this.hederaNetSubject.value;
    const urlPrefix = res == 'mainnet' ? 'app' : 'testnet';
    switch (type) {
      case 'topics':
        url = `https://${urlPrefix}.dragonglass.me/hedera/topics/${params}`;
        break;
      case 'tokens':
        url = `https://${urlPrefix}.dragonglass.me/hedera/tokens/${params}`;
        break;
      case 'accounts':
        url = `https://${urlPrefix}.dragonglass.me/hedera/accounts/${params}`;
        break;
      default:
        url = '';
        break;
    }
    return url;
  }
}

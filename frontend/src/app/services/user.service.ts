import {Injectable} from "@angular/core";
import {BehaviorSubject, catchError, Observable, Subject, throwError} from "rxjs";
import {IAuthUser, IStandardRegistryAccount, IStandardRegistryAccountResponse, IUserProfile} from "@app/models/user";
import {LocalStorageService} from "@app/services/local-storage";
import {HttpClient} from "@angular/common/http";
import {API_URLS} from "@app/constants/api";
import {Router} from "@angular/router";
import {URLS_PATHS} from "@app/constants/path";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public readonly accessTokenSubject: Subject<string | null> = new Subject<string | null>();
  public readonly currentUser: BehaviorSubject<IAuthUser | null> = new BehaviorSubject<IAuthUser | null>(null);
  public readonly currentProfile: BehaviorSubject<IUserProfile | null> = new BehaviorSubject<IUserProfile | null>(null);

  constructor(private _storage: LocalStorageService, private _http: HttpClient, private _router: Router) {
    this.currentUser.next(this.getUser());
    if(this.currentUser.value != null) {
      this.loadProfile();
    }
  }

  get userName(): string {
    return this.currentUser.value?.username || '';
  }

  public isAuth(): boolean {
    return !!this.currentUser.value || !!this.getUser();
  }

  public loadProfile(): Promise<IUserProfile | any> {
    return new Promise<any>( (resolve, reject) => {
      this.getProfile()
        .pipe(
          catchError( (err: any) => {
            reject(err);
            return throwError(err);
          }),
        )
        .subscribe( profile => {
          this.setProfile(profile);
          resolve(profile);
        })
    } )
  }

  public getStandardRegistries(): Observable<IStandardRegistryAccountResponse> {
    return this._http.get<IStandardRegistryAccountResponse>(API_URLS.accounts.standardRegistries);
  }

  public setProfile(profile: IUserProfile): void {
    this.currentProfile.next(profile);
    this._storage.setItem("profile", JSON.stringify(profile));
  }

  public setUser(user: IAuthUser) {
    this.currentUser.next(user);
    this._storage.setItem("user", JSON.stringify(user));
    this.setAccessToken(user.accessToken)
    this.loadProfile();
  }

  public getAccessToken(): string {
    return this._storage.getItem("accessToken") as string ?? null;
  }

  public setAccessToken(accessToken: string) {
    localStorage.setItem('accessToken', accessToken);
    this.accessTokenSubject.next(accessToken);
  }

  public removeAccessToken() {
    localStorage.removeItem('accessToken');
    this.accessTokenSubject.next(null);
  }

  public getUser(): IAuthUser | null {
    return JSON.parse(this._storage.getItem("user") as string) ?? null;
  }

  public logout(): void {
    this._storage.clear();
    this.currentUser.next(null);
    this._router.navigateByUrl('/auth/sign-in');
  }

  public getProfile(): Observable<IUserProfile> {
    return this._http.get<IUserProfile>(API_URLS.profile.base.replace('{username}', this.userName));
  }

  public pushSetProfile(profile: IUserProfile): Observable<{ taskId: string, expectation: number }> {
    return this._http.put<{ taskId: string, expectation: number }>(API_URLS.profile.push.replace('{username}', this.userName), profile);
  }

  public getBalance(): Observable<any> {
    return this._http.get<any>(API_URLS.accounts.balance);
  }

}

import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {AuthUser} from "@app/models/user";
import {LocalStorageService} from "@app/services/local-storage";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public readonly currentUser: BehaviorSubject<AuthUser | null> = new BehaviorSubject<AuthUser | null>(null); // todo add user interface

  constructor(private _storage: LocalStorageService) {
    this.currentUser.next(this.getUser());
  }

  public isAuth(): boolean {
    return !!this.currentUser.value || !!this.getUser();
  }

  public setUser(user: AuthUser) {
    this._storage.setItem("user", JSON.stringify(user));
    this._storage.setItem("accessToken", JSON.stringify(user.accessToken));
  }

  public getUser(): AuthUser | null {
    return JSON.parse(this._storage.getItem("user") as string) ?? null;
  }

}

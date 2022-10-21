import {Injectable} from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad, Route,
  Router,
  RouterStateSnapshot, UrlSegment, UrlTree
} from "@angular/router";
import {UserService} from "@app/services/user.service";
import {URLS_PATHS} from "@app/constants/path";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ConfirmedUserGuard implements CanActivate, CanLoad, CanActivateChild {

  constructor(private _userService: UserService, private _router: Router) {
  }

  private userIsConfirmed(): boolean {
    if (this._userService.currentProfile?.value?.confirmed) {
      return true;
    } else {
      this._router.navigate([URLS_PATHS.finishRegistration])
      return false;
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userIsConfirmed();
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userIsConfirmed();
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userIsConfirmed();
  }

}

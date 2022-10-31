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
import {filter, Observable, of, switchMap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ConfirmedUserGuard implements CanActivate, CanLoad, CanActivateChild {

  constructor(private _userService: UserService, private _router: Router) {
  }

  private userIsConfirmed(): Observable<any> {
    return this._userService.currentProfile
      .pipe(
        filter((value) => value != null),
        switchMap( (profile) => {
          if (!profile?.confirmed) {
            this._router.navigateByUrl(URLS_PATHS.finishRegistration);
          }
          return of( profile?.confirmed )
        })
      );
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

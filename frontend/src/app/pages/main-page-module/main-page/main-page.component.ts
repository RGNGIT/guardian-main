import {Component, OnDestroy} from "@angular/core";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {AUDITOR_MENU, DEFAULT_MENU, ROOT_AUTHORITY_MENU} from "@app/constants/menu";
import {UserService} from "@app/services/user.service";
import {HeaderMenuService} from "@app/services/header-menu.service";
import {Router} from "@angular/router";
import {LoaderService} from "@app/services/loader-service";
import {combineLatest, filter, finalize, forkJoin, from, map, of, Subscription, switchMap, withLatestFrom} from "rxjs";
import {URLS_PATHS} from "@app/constants/path";
import {USER_ROLES} from "@app/enums/user-roles";

@UntilDestroy()
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnDestroy {

  private subscription!: Subscription;

  constructor(
    private _userService: UserService,
    private _headerMenuService: HeaderMenuService,
    private _router: Router,
    public _loaderService: LoaderService
  ) {
    this._loaderService.enable();

    this.subscription = combineLatest([
      _userService.currentUser.pipe(filter( (value) => !!value)),
      _userService.currentProfile.pipe(filter( (value) => !!value)),
    ]).pipe(
      untilDestroyed(this)
    )
    .subscribe( ([user, profile])  => {
      // this._loaderService.disable();
      switch (user?.role) {
        case USER_ROLES.STANDARD_REGISTRY:
          this._headerMenuService.currentMenuItems.next(ROOT_AUTHORITY_MENU);
          break;
        case USER_ROLES.AUDITOR:
          this._headerMenuService.currentMenuItems.next(AUDITOR_MENU);
          break;
        default:
          this._headerMenuService.currentMenuItems.next(DEFAULT_MENU);
          break;
      }

      if (profile?.confirmed) {
        this._router.navigateByUrl(this._headerMenuService.currentMenuItems.value[0].routerLink)
      } else {
        this._router.navigateByUrl(URLS_PATHS.finishRegistration)
      }
      //
    } );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

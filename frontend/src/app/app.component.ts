import {AfterContentInit, AfterViewInit, Component} from '@angular/core';
import {NavigationStart, Router} from "@angular/router";
import {LoaderService} from "@app/services/loader-service";
import {UserService} from "@app/services/user.service";
import {userInfo} from "os";
import {BehaviorSubject, Observable, of} from "rxjs";
import {IAuthUser} from "@app/models/user";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'serapis-frontend';

  get showHeader(): Observable<IAuthUser | null> {
    return this._userService.currentUser;
  }

  constructor(private router: Router, public _loaderService: LoaderService, private _userService: UserService) {

  }

}

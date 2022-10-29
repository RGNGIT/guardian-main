import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {LoaderService} from "@app/services/loader-service";
import {UserService} from "@app/services/user.service";
import {Observable} from "rxjs";
import {IAuthUser} from "@app/models/user";
import {WebSocketService} from "@app/services/web-socket.service";

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

  constructor(
    private router: Router,
    public _loaderService: LoaderService,
    private _userService: UserService,
    private _swService: WebSocketService
  ) {

  }

}

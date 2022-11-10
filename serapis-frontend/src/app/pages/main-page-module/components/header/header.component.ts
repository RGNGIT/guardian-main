import { Component, OnInit } from '@angular/core';
import {HeaderMenuService} from "@app/services/header-menu.service";
import {NavItem} from "@app/models/header.model";
import {UserService} from "@app/services/user.service";
import {Observable} from "rxjs";


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  menuItems: Observable<NavItem[]> = this._headMenuService.currentMenuItems;
  userName = this._userService.userName;
  userLetters = this.userName.split(/[\s,. ]+/).map( item => item.charAt(0)).join('').toUpperCase();

  constructor(private _headMenuService: HeaderMenuService, private _userService: UserService) {

  }

  ngOnInit(): void {}

  logoutHandler() {
    this._userService.logout();
  }
}

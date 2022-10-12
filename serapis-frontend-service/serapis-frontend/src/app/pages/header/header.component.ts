import { Component, OnInit } from '@angular/core';
import {HeaderMenuService} from "@app/services/header-menu.service";
import {NavItem} from "@app/models/header.model";


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  menuItems!: NavItem[];

  constructor(private _headMenuService: HeaderMenuService) {
    this.menuItems = this._headMenuService.getMenuItems();
  }

  ngOnInit(): void {}


}

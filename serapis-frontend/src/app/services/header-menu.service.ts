import {Injectable} from "@angular/core";
import {NavItem} from "@app/models/header.model";
import {DEFAULT_MENU} from "@app/constants/menu";
import {UntilDestroy} from "@ngneat/until-destroy";
import {BehaviorSubject} from "rxjs";

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class HeaderMenuService {
  public readonly currentMenuItems: BehaviorSubject<NavItem[]> = new BehaviorSubject<NavItem[]>(DEFAULT_MENU);

  constructor() {

  }

  public getMenuItems(): NavItem[] {
    return this.currentMenuItems.value;
  }
}

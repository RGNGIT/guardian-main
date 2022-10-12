import {Injectable} from "@angular/core";
import {NavItem} from "@app/models/header.model";
import {installerMenuItems} from "@app/constants/menu";

@Injectable({
  providedIn: 'root'
})
export class HeaderMenuService {

  // todo rewrite it
  public getMenuItems(): NavItem[] {
    return installerMenuItems
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { NavItem } from '@app/models/header.model';

@Component({
  selector: 'app-header-navbar',
  templateUrl: './header-navbar.component.html',
  styleUrls: ['./header-navbar.component.scss']
})
export class HeaderNavbarComponent implements OnInit {
  @Input() navItems: NavItem[] | null = [];

  ngOnInit(): void {}
}

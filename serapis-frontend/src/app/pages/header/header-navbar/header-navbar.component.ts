import { Component, Input, OnInit } from '@angular/core';
import { NavItem } from '@app/models/header.model';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-header-navbar',
  templateUrl: './header-navbar.component.html',
  styleUrls: ['./header-navbar.component.scss']
})
export class HeaderNavbarComponent implements OnInit {
  @Input() navItems: NavItem[] = [];

  ngOnInit(): void {}
}

import {NgModule} from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import {MainPageComponent} from "./main-page/main-page.component";
import {AuthGuard} from "@app/services/guards/auth.guard";
import {replaceUrlFirstSlash} from "@app/utils/utils";
import {URLS_PATHS} from "@app/constants/path";
import {ConfirmedUserGuard} from "@app/services/guards/confirmed-user.guard";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {HeaderComponent} from "./components/header/header.component";
import {HeaderNavbarComponent} from "./components/header/header-navbar/header-navbar.component";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";

// todo configure route in dependent role
const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    children: [
      {
        path: 'config',
        loadChildren: () => import('../config-page-module/config-page.module').then(
          m => m.ConfigPageModule
        ),
        canLoad: [ AuthGuard, ConfirmedUserGuard ]
      },
      {
        path: 'schemas',
        loadChildren: () => import('../schemes-page-module/schemas-page.module').then(
          m => m.SchemasPageModule
        ),
        canLoad: [ AuthGuard, ConfirmedUserGuard ]
      },
      {
        path: 'goals',
        loadChildren: () => import('../goals-page-module/goals-page.module').then(
          m => m.GoalsPageModule
        ),
        canLoad: [ AuthGuard, /*ConfirmedUserGuard*/ ]
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard-page-module/dashboard-page.module').then(
          m => m.DashboardPageModule
        ),
        canLoad: [ AuthGuard, /*ConfirmedUserGuard*/ ]
      },
      {
        path: replaceUrlFirstSlash(URLS_PATHS.finishRegistration),
        loadChildren: () => import('../finish-registration/finish-registration.module').then(
          m => m.FinishRegistrationModule
        ),
        canLoad: [ AuthGuard ]
      },
      {
        path: replaceUrlFirstSlash(URLS_PATHS.policies.base),
        loadChildren: () => import('../policies-page-module/policies-page.module').then(
          m => m.PoliciesPageModule
        ),
        canLoad: [ AuthGuard, ConfirmedUserGuard ]
      },
      {
        path: replaceUrlFirstSlash(URLS_PATHS.tokens.base),
        loadChildren: () => import('../tokens-page-module/tokens-page.module').then(
          m => m.TokensPageModule
        ),
        canLoad: [ AuthGuard, ConfirmedUserGuard ]
      }
    ],
  },
];


@NgModule({
  declarations: [
    MainPageComponent,
    HeaderComponent,
    HeaderNavbarComponent,
  ],
  imports: [RouterModule.forChild(routes), AsyncPipe, NgIf, MatProgressBarModule, MatMenuModule, MatIconModule, NgForOf],
  exports: [],
  bootstrap: []
})
export class MainPageModule {}

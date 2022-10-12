import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {URLS_PATHS} from "@app/constants/path";
import {AuthGuard} from "@app/services/guards/auth.guard";
import * as path from "path";

const routes: Routes = [
  {
    path: URLS_PATHS.auth.base,
    loadChildren: () =>
      import('./pages/auth-page-module/auth-page.module').then(
        m => m.AuthPageModule
      ),
  },
  {
    path: '',
    loadChildren: () => import('./pages/main-page-module/main-page.module').then(
      m => m.MainPageModule
    ),
    canActivate: [ AuthGuard ],
    canLoad: [ AuthGuard ],
    canActivateChild: [ AuthGuard ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

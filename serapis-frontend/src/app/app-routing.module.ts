import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {URLS_PATHS} from "@app/constants/path";
import {replaceUrlFirstSlash} from "@app/utils/utils";
import {PageNotFoundComponent} from "./404page/page-not-found.component";
import {AuthGuard} from "@app/services/guards/auth.guard";

const routes: Routes = [
  {
    path: replaceUrlFirstSlash(URLS_PATHS.auth.base),
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
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

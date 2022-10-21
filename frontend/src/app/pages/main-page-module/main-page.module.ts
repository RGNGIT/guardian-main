import {NgModule} from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from "../dashboard/dashboard.component";
import {GoalsComponent} from "../goals/goals.component";
import {MainPageComponent} from "./main-page/main-page.component";
import {AuthGuard} from "@app/services/guards/auth.guard";
import {replaceUrlFirstSlash} from "@app/utils/utils";
import {URLS_PATHS} from "@app/constants/path";
import {ConfirmedUserGuard} from "@app/services/guards/confirmed-user.guard";
import {AsyncPipe, NgIf} from "@angular/common";

// todo configure route in dependent role
const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [ AuthGuard, ConfirmedUserGuard ]
      },
      {
        path: 'goals',
        component: GoalsComponent,
        canActivate: [ AuthGuard, ConfirmedUserGuard ]
      },
      {
        path: 'config',
        loadChildren: () => import('../config-page-module/config-page.module').then(
          m => m.ConfigPageModule
        ),
        canLoad: [ AuthGuard, ConfirmedUserGuard ]
      },
      {
        path: replaceUrlFirstSlash(URLS_PATHS.finishRegistration),
        loadChildren: () => import('../finish-registration/finish-registration.module').then(
          m => m.FinishRegistrationModule
        )
      }
    ]
  },

]


@NgModule({
  declarations: [
    MainPageComponent
  ],
  imports: [RouterModule.forChild(routes), AsyncPipe, NgIf],
  exports: [],
  bootstrap: []
})
export class MainPageModule {}

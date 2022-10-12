import {NgModule} from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from "../dashboard/dashboard.component";
import {GoalsComponent} from "../goals/goals.component";
import {MainPageComponent} from "./main-page/main-page.component";
import {URLS_PATHS} from "@app/constants/path";
import {AuthGuard} from "@app/services/guards/auth.guard";

// todo configure route in dependent role
const routes: Routes = [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
      canActivate: [ AuthGuard ]
    },
    {
      path: 'goals',
      component: GoalsComponent,
      canActivate: [ AuthGuard ]
    },
]


@NgModule({
  declarations: [
    MainPageComponent
  ],
  imports: [RouterModule.forChild(routes)],
  exports: [],
  bootstrap: [MainPageComponent]
})
export class MainPageModule {}

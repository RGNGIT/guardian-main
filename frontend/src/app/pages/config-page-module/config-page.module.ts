import {NgModule} from "@angular/core";
import {ConfigPageComponent} from "./config-page/config-page.component";
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "@app/shared/shared.module";
import {MatIconModule} from "@angular/material/icon";

const routes: Routes = [
  {
    path: '',
    component: ConfigPageComponent
  }
]

const components = [
  ConfigPageComponent
]

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    MatIconModule
  ],
  exports: [
    ...components
  ],
  bootstrap: []
})
export class ConfigPageModule {}

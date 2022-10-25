import {NgModule} from "@angular/core";
import {PoliciesPageComponent} from "./policies-page/policies-page.component";
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "@app/shared/shared.module";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

const components = [
  PoliciesPageComponent
];

const routes: Routes = [
  {
    path: '',
    component: PoliciesPageComponent
  }
]

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    NgIf
  ]
})
export class PoliciesPageModule {}

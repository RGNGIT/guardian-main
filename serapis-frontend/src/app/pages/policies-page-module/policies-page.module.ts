import {NgModule} from "@angular/core";
import {PoliciesPageComponent} from "./policies-page/policies-page.component";
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "@app/shared/shared.module";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {JsonPipe, NgForOf, NgIf, NgSwitch, NgSwitchCase} from "@angular/common";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatSelectModule} from "@angular/material/select";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

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
    NgIf,
    NgForOf,
    JsonPipe,
    MatProgressBarModule,
    MatSelectModule,
    NgSwitch,
    NgSwitchCase,
    FormsModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSlideToggleModule
  ]
})
export class PoliciesPageModule {}

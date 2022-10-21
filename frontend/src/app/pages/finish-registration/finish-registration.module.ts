import {NgModule} from "@angular/core";
import {FinishRegistrationComponent} from "./finish-registration/finish-registration.component";
import {RouterModule, Routes} from "@angular/router";
import {AsyncPipe, NgForOf, NgIf, NgSwitch, NgSwitchCase} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "@app/shared/shared.module";
import {MatButtonModule} from "@angular/material/button";

const routes: Routes = [
  {
    path: '',
    component: FinishRegistrationComponent
  }
]

@NgModule({
  declarations: [
    FinishRegistrationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    AsyncPipe,
    NgSwitch,
    NgIf,
    NgSwitchCase,
    MatInputModule,
    MatSelectModule,
    NgForOf,
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule
  ]
})
export class FinishRegistrationModule{}

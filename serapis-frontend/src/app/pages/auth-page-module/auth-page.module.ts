import { NgModule } from '@angular/core';
import {SignInComponent} from "./sign-in/sign-in.component";
import {SignUpComponent} from "./sign-up/sign-up.component";
import {RouterModule, Routes} from "@angular/router";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {SharedModule} from "@app/shared/shared.module";
import {MatStepperModule} from "@angular/material/stepper";
import {MatButtonModule} from "@angular/material/button";
import {StepperComponent} from "./sign-up/components/stepper/stepper.component";
import {StepComponent} from "./sign-up/components/step/step.component";
import {StepTitleDirective} from "./sign-up/directives/step-title.directive";
import {StepNextButtonDirective} from "./sign-up/directives/step-next-button.directive";
import {StepPreviousButtonDirective} from "./sign-up/directives/step-previous-button.directive";
import {ForgotPasswordComponent} from "./sign-in/forgot-password/forgot-password.component";
import {MatDialogModule} from "@angular/material/dialog";
import {PasswordChangeComponent} from "./password-change/password-change.component";
import {SignService} from "./services/sign.service";
import {HttpClientModule} from "@angular/common/http";
import {ConfirmComponent} from "./confirm/confirm.component";
import {replaceUrlFirstSlash} from "@app/utils/utils";
import {URLS_PATHS} from "@app/constants/path";
import {MatSelectModule} from "@angular/material/select";

const components = [
  SignInComponent,
  SignUpComponent,
  StepperComponent,
  StepComponent,
  StepTitleDirective,
  StepNextButtonDirective,
  StepPreviousButtonDirective,
  ForgotPasswordComponent,
  PasswordChangeComponent,
  ConfirmComponent
];

const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: "full",
  },
  {
    path: replaceUrlFirstSlash(URLS_PATHS.auth.signIn),
    component: SignInComponent
  },
  {
    path: replaceUrlFirstSlash(URLS_PATHS.auth.signUp),
    component: SignUpComponent
  },
  {
    path: replaceUrlFirstSlash(URLS_PATHS.auth.passwordChange),
    component: PasswordChangeComponent
  },
  {
    path: replaceUrlFirstSlash(URLS_PATHS.auth.confirm),
    component: ConfirmComponent
  }
]

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    RouterModule.forChild(routes),
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    SharedModule,
    MatStepperModule,
    MatButtonModule,
    MatDialogModule,
    HttpClientModule,
    MatSelectModule
  ],
  providers: [
    SignService
  ],
  exports: [
    ...components
  ],
})
export class AuthPageModule {

}

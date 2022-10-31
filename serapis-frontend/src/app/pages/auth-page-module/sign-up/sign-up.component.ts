import {Component, ViewChild} from "@angular/core";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {catchError, finalize, throwError} from "rxjs";
import {URLS_PATHS} from "@app/constants/path";
import {mustMatch, SerapisErrorStateMatcher} from "@app/utils/utils";
import {SignService} from "../services/sign.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {StepperComponent} from "./components/stepper/stepper.component";
import {LoaderService} from "@app/services/loader-service";

@UntilDestroy()
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent {
  @ViewChild('stepperComponent') stepperComponent!: StepperComponent;

  roles: string[] = [
    'USER', 'STANDARD_REGISTRY', 'AUDITOR', 'INSTALLER'
  ];

  matcher = new SerapisErrorStateMatcher();
  hide = true;
  canActivateThirdStep = false;
  canCompleteThirdStep = false;

  firstFormGroup = this._formBuilder.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
  });
  secondFormGroup = this._formBuilder.group({
      username: ['', [Validators.required, ]],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: mustMatch('password', 'confirmPassword')
    }
  );
  urlsRoutes = URLS_PATHS;

  get emailFormControl(): FormControl {
    return this.secondFormGroup.controls['email'] as FormControl;
  }

  get passwordFormControl(): FormControl {
    return this.secondFormGroup.controls['password'] as FormControl;
  }

  get confirmPasswordFormControl(): FormControl {
    return this.secondFormGroup.controls['confirmPassword'] as FormControl;
  }

  get usernameFormControl(): FormControl {
    return this.secondFormGroup.controls['username'] as FormControl;
  }

  get firstNameFormControl(): FormControl {
    return this.firstFormGroup.controls['first_name'] as FormControl;
  }

  get lastNameFormControl(): FormControl {
    return this.firstFormGroup.controls['last_name'] as FormControl;
  }

  get successIconShow(): boolean {
    return this.confirmPasswordFormControl.value === this.passwordFormControl.value
    && this.confirmPasswordFormControl.valid && this.passwordFormControl.value
  }

  constructor(private _formBuilder: FormBuilder,
              private _signService: SignService,
              private _loadingService: LoaderService
              ) {
  }

  submitForm() {
    this._loadingService.enable();
    this._signService.registerUser({ ...this.firstFormGroup.value, ...this.secondFormGroup.value })
      .pipe(
        catchError( (err) => {
          return throwError(err);
        }),
        untilDestroyed(this),
        finalize( ()=> { this._loadingService.disable() })
      )
      .subscribe( result => {
        switch (result.code) {
          case 9:
            this.usernameFormControl.setErrors( { exist: true } )
            this.emailFormControl.setErrors( { exist: true } )
            break;

          default:
            this.canCompleteThirdStep = true;
            this.stepperComponent.stepClickHandler(2, true);
            break;
        }

      })
  }

}

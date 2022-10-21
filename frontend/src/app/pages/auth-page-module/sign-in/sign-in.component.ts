import {Component, OnInit} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import {URLS_PATHS} from "@app/constants/path";
import {SerapisErrorStateMatcher} from "@app/utils/utils";
import {ForgotPasswordComponent} from "./forgot-password/forgot-password.component";
import {MatDialog} from "@angular/material/dialog";
import {SignService} from "../services/sign.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {UserService} from "@app/services/user.service";
import {Router} from "@angular/router";
import {LoaderService} from "@app/services/loader-service";
import {catchError, finalize, throwError} from "rxjs";


@UntilDestroy()
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  signInForm!: FormGroup;
  matcher = new SerapisErrorStateMatcher();
  urlsRoutes = URLS_PATHS;
  hide = true;

  constructor(
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private _router: Router,
    private _apiService: SignService,
    private _userService: UserService,
    private _loadService: LoaderService
  ) {

  }

  get emailFormControl(): FormControl {
    return this.signInForm.controls['email'] as FormControl;
  }

  get passwordFormControl(): FormControl {
    return this.signInForm.controls['password'] as FormControl;
  }

  ngOnInit() {
    this.signInForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    })
  }

  forgotPasswordHandler(event: MouseEvent): void {
    event.stopPropagation();
    this.dialog.open(ForgotPasswordComponent, {
      data: {
        email: this.emailFormControl.value,
      },
    });
  }

  auth(): void {
    this._loadService.enable();
    this._apiService.signIn(this.signInForm.value)
      .pipe(
        catchError( (err) => {
          this.emailFormControl.setErrors( { authError: true } )
          this.passwordFormControl.setErrors( { authError: true } )
          return throwError(() => err)
        }),
        untilDestroyed(this),
        finalize(() => this._loadService.disable())
      )
      .subscribe( user => {
        this._userService.setUser(user.message);
        this._router.navigateByUrl('/')
    })
  }
}

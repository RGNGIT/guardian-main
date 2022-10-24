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
import {LocalStorageService} from "@app/services/local-storage";


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
    private _loadService: LoaderService,
    private _localStorage: LocalStorageService
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
    this._localStorage.clear();
    this._loadService.enable();
    this._apiService.signIn(this.signInForm.value)
      .pipe(
        catchError( (err) => {
          this.emailFormControl.setErrors( { authError: true } )
          this.passwordFormControl.setErrors( { authError: true } )
          this._loadService.disable()
          return throwError(() => err)
        }),
        untilDestroyed(this),
      )
      .subscribe( user => {
        this._userService.setUser(user.message);
        this._loadService.disable()
        this._router.navigateByUrl('/')
    })
  }
}

import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormControl, Validators} from "@angular/forms";
import {mustMatch, SerapisErrorStateMatcher} from "@app/utils/utils";
import {ActivatedRoute, Router} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {finalize} from "rxjs";
import {SignService} from "../services/sign.service";
import {LoaderService} from "@app/services/loader-service";
import {API_URLS} from "@app/constants/api";
import {URLS_PATHS} from "@app/constants/path";

@UntilDestroy()
@Component({
  selector: 'password-change',
  templateUrl: './password-change.component.html',
  styleUrls: ['./password-change.component.scss']
})
export class PasswordChangeComponent implements OnInit {
  hide = true;
  matcher = new SerapisErrorStateMatcher();
  passwordChange = this._formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    {
      validators: mustMatch('password', 'confirmPassword')
    }
  );
  private params!: { u: string, c: string} | any;

  get passwordFormControl(): FormControl {
    return this.passwordChange.controls['password'] as FormControl;
  }

  get confirmPasswordFormControl(): FormControl {
    return this.passwordChange.controls['confirmPassword'] as FormControl;
  }

  constructor(
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _apiService: SignService,
    private _loadService: LoaderService
  ) {
  }

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      this.params = params;
    });
  }


  submitForm() {
    this._loadService.enable();
    this._apiService.passwordChange({...this.passwordChange.value, ...this.params})
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this._loadService.disable();
        })
      )
      .subscribe( data => {
        this._router.navigateByUrl(URLS_PATHS.auth.base+URLS_PATHS.auth.signIn);
      })
  }
}

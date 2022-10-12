import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {SerapisErrorStateMatcher} from "@app/utils/utils";
import {SignService} from "../../services/sign.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {LoaderService} from "@app/services/loader-service";
import {finalize} from "rxjs";

@UntilDestroy()
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  matcher = new SerapisErrorStateMatcher();

  get emailFormControl(): FormControl {
    return this.forgotPasswordForm.controls['email'] as FormControl;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private fb: FormBuilder,
    public dialog: MatDialog,
    private _apiService: SignService,
    private _loadService: LoaderService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  submitForm() {
    this._loadService.enable();
    this._apiService.passwordReset(this.forgotPasswordForm.value)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this._loadService.disable();
          this.dialog.closeAll();
        })
      )
      .subscribe( data => {
      console.log(data);
    })
  }
}



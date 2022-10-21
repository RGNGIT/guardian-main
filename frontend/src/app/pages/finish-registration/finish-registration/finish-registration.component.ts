import {Component, OnInit} from "@angular/core";
import {UserService} from "@app/services/user.service";
import {USER_ROLES} from "@app/enums/user-roles";
import {LoaderService} from "@app/services/loader-service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {SchemasService} from "@app/services/schemas.service";
import {combineLatest, delay, switchMap, timeout} from "rxjs";
import {IStandardRegistryAccount} from "@app/models/user";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Schema} from "@app/models/schema";

@UntilDestroy()
@Component({
  selector: 'app-finish-registration',
  templateUrl: './finish-registration.component.html',
  styleUrls: ['./finish-registration.component.scss']
})
export class FinishRegistrationComponent implements OnInit {
  userProfile = this._userService.currentProfile;
  userRoles = USER_ROLES;
  standardRegistries: IStandardRegistryAccount[] = [];
  schema!: any;
  dataForm!: FormGroup;
  vcForm: FormGroup;
  hideVC: any;
  hederaForm = this._formBuilder.group({
    standardRegistry: ['', Validators.required],
    id: ['', Validators.required],
    key: ['', Validators.required],
  });

  constructor(
    private _userService: UserService,
    private _loaderService: LoaderService,
    private _schemasService: SchemasService,
    private _formBuilder: FormBuilder
  ) {
    this._loaderService.enable();
    this.dataForm = this._formBuilder.group({
      parent: ['', Validators.required]
    });
    this.hideVC = {
      id: true
    }
    this.vcForm = this._formBuilder.group({});
  }

  ngOnInit() {

    combineLatest([
      this.userProfile
        // .pipe( switchMap( (profile)=> this._schemasService.getEntityByName(profile?.role || ''))),
        .pipe( switchMap( (profile)=> this._schemasService.getEntityByName('STANDARD_REGISTRY'))),
      this._userService.getStandardRegistries()
    ]).pipe(
      // delay(3000),
      untilDestroyed(this)
    )
      .subscribe( ([entity, standardRegistries]) => {
        if (entity) {
          this.schema = new Schema(entity);
          // @ts-ignore
          this.hederaForm.addControl('vc', this.vcForm);
        } else {
          this.schema = null;
        }
        this.standardRegistries = standardRegistries.message.filter(item => !!item.did);
        this._loaderService.disable();
      } );

  }

  onChangeForm() {
    this.vcForm.updateValueAndValidity();
  }

  onHederaSubmit() {

  }

  randomKey() {

  }
}

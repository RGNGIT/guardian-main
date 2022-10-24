import {Component, OnInit} from "@angular/core";
import {UserService} from "@app/services/user.service";
import {USER_ROLES} from "@app/enums/user-roles";
import {LoaderService} from "@app/services/loader-service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {SchemasService} from "@app/services/schemas.service";
import {catchError, combineLatest, switchMap, throwError} from "rxjs";
import {IStandardRegistryAccount} from "@app/models/user";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Schema} from "@app/models/schema";
import {TasksService} from "@app/services/task.service";
import {DemoService} from "@app/services/demo.service";
import {WebSocketService} from "@app/services/web-socket.service";
import {Router} from "@angular/router";

enum OperationMode {
  None, Generate, SetProfile, Associate
}

interface IHederaForm {
  id: string,
  key: string,
  standardRegistry: string,
  vc?: any
}

@UntilDestroy()
@Component({
  selector: 'app-finish-registration',
  templateUrl: './finish-registration.component.html',
  styleUrls: ['./finish-registration.component.scss']
})
export class FinishRegistrationComponent implements OnInit {
  loading: boolean = false;
  userProfile = this._userService.currentProfile;
  userRoles = USER_ROLES;
  standardRegistries: IStandardRegistryAccount[] = [];
  schema!: any;
  dataForm!: FormGroup;
  vcForm: FormGroup;
  hideVC: any;
  hederaForm = this._formBuilder.group({
    standardRegistry: [''],
    id: ['', Validators.required],
    key: ['', Validators.required],
    vc: this._formBuilder.group({})
  });
  operationMode: OperationMode = OperationMode.None;
  taskId: string | undefined = undefined;
  expectedTaskMessages: number = 0;
  value: any;

  constructor(
    private _userService: UserService,
    private _loaderService: LoaderService,
    private _schemasService: SchemasService,
    private _formBuilder: FormBuilder,
    private _taskService: TasksService,
    private _demoService: DemoService,
    private _wsService: WebSocketService,
    private _router: Router
  ) {

    this.hideVC = {
      id: true
    }
    this.vcForm = this._formBuilder.group({});

    this.hederaForm.valueChanges.subscribe( data => {
      console.log(this.hederaForm)
    })
  }

  ngOnInit() {
    this._loaderService.enable();
    combineLatest([
      this.userProfile
        .pipe( switchMap( (profile)=> this._schemasService.getEntityByName(profile?.role || ''))),
        // .pipe( switchMap( (profile)=> this._schemasService.getEntityByName('STANDARD_REGISTRY'))),
      this._userService.getStandardRegistries()
    ]).pipe( untilDestroyed(this) )
      .subscribe( ([entity, standardRegistries]) => {
        if (entity) {
          this.schema = new Schema(entity);
          // @ts-ignore
          this.hederaForm.addControl('vc', this.vcForm);
        } else {
          this.schema = null;
        }
        if (this.userProfile.value?.role !== USER_ROLES.STANDARD_REGISTRY) {
          this.hederaForm.get('standardRegistry')?.addValidators(Validators.required);
        }
        this.standardRegistries = standardRegistries.message.filter(item => !!item.did);
        this._loaderService.disable();
      } );
  }

  onChangeForm() {
    this.vcForm.updateValueAndValidity();
  }

  onHederaSubmit() {
    if (this.hederaForm.valid) {
      this.createDID(this.hederaForm.value);
    }
  }

  createDID(data: any) {
    this.loading = true;
    // this.headerProps.setLoading(true);
    const vcDocument = data.vc;
    const profile: any = {
      hederaAccountId: data.id,
      hederaAccountKey: data.key,
      parent: data.standardRegistry,
    }
    if (vcDocument) {
      profile.vcDocument = vcDocument;
    }

    this._userService.pushSetProfile(profile)
      .pipe(
        catchError((err) => {
          // this.headerProps.setLoading(false);
          console.error(err);
          return throwError(() => err)
        }),
        // finalize(() => this.loading = false)
      )
      .subscribe((result) => {
      const { taskId, expectation } = result;
      this.taskId = taskId;
      this.expectedTaskMessages = expectation;
      this.operationMode = OperationMode.SetProfile;
    });
  }

  randomKey() {
    this.loading = true;
    const value: any = {
      standardRegistry: this.hederaForm.value?.standardRegistry || '',
    }
    if (this.hederaForm.value.vc) {
      value.vc = this.hederaForm.value.vc;
    }

    this._demoService.pushGetRandomKey()
      .pipe(
        catchError( (err) => {
          this.loading = false;
          value.id = '';
          value.key = '';
          this.hederaForm.setValue(value);
          return throwError(() => err)
        }),
        // finalize(() => this.loading = false)
      )
      .subscribe((result: any) => {
        const { taskId, expectation } = result;
        this.taskId = taskId;
        this.expectedTaskMessages = expectation;
        this.operationMode = OperationMode.Generate;
        this.value = value;
    } );
  }

  onAsyncError(error: any) {
    // this.informService.processAsyncError(error);
    this.loading = false;
    this.taskId = undefined;
    this.value = null;
  }

  onAsyncCompleted() {
    if (this.taskId) {
      const taskId = this.taskId;
      const value = this.value;
      const operationMode = this.operationMode;
      this.taskId = undefined;
      this.operationMode = OperationMode.None;
      switch (operationMode) {
        case OperationMode.Generate:
          this._taskService.get(taskId).subscribe((task) => {
            const { id, key } = task.result;
            value.id = id;
            value.key = key;
            this.hederaForm.setValue(value);
            this.loading = false;
          });
          break;
        case OperationMode.SetProfile:
          this._wsService.updateProfile();
          this._userService.loadProfile().then( () => {
              this._router.navigateByUrl("/")
            }
          );
          // this.loadDate();
          break;
        case OperationMode.Associate:
          this._userService.loadProfile().then( () => {
              this._router.navigateByUrl("/")
            }
          );
          // this.loadDate();
          break;
        default:
          console.log('Not supported mode');
          break;
      }
    }
  }
}

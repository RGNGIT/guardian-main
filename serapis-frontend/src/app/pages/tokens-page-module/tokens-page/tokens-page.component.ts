import {AfterContentInit, AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {DataGrid} from "@app/shared/components/data-grid/data-grid.model";
import {TasksService} from "@app/services/task.service";
import {Dialog} from "@angular/cdk/dialog";
import {TokensService} from "@app/services/tokens.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {LoaderService} from "@app/services/loader-service";
import {catchError, finalize, forkJoin, throwError} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, ActivatedRouteSnapshot, Router} from "@angular/router";
import {PoliciesService} from "@app/services/policies.service";
import {SettingsService} from "@app/services/setting.service";
import {UserService} from "@app/services/user.service";
import {ITokenInfo} from "@app/models/token";

enum OperationMode {
  None, Create, Kyc, Associate
}

@UntilDestroy()
@Component({
  selector: 'app-tokens-page',
  templateUrl: './tokens-page.component.html',
  styleUrls: ['./tokens-page.component.scss']
})
export class TokensPageComponent implements AfterViewInit, OnInit {
  @ViewChild('tokenIdCellTempl', {read:TemplateRef, static: false}) tokenIdCellTempl!: TemplateRef<any>;
  @ViewChild('actionsCellTempl', {read:TemplateRef, static: false}) actionsCellTempl!: TemplateRef<any>;
  @ViewChild('assocCell', {read:TemplateRef, static: false}) assocCell!: TemplateRef<any>;
  @ViewChild('kycCell', {read:TemplateRef, static: false}) kycCell!: TemplateRef<any>;
  @ViewChild('frozenCell', {read:TemplateRef, static: false}) frozenCell!: TemplateRef<any>;
  dataSR: DataGrid = { columnDefs: [], rowData: [] };

  asyncProcess: boolean = false;
  taskId: string | undefined = undefined;
  expectedTaskMessages: number = 0;
  operationMode: OperationMode = OperationMode.None;

  currentPolicy: any = '';
  policies: any[] | null = null;

  dataForm!: FormGroup;
  ft: boolean = true;

  get tokenUrl(): string {
    return this._settingService.getHederaUrl('tokens', '');
  }

  constructor(
    private _taskService: TasksService,
    private _dialog: Dialog,
    private _apiService: TokensService,
    private _loader: LoaderService,
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _apiPolicy: PoliciesService,
    private _settingService: SettingsService,
    private _userService: UserService
  ) {

  }

  ngAfterViewInit(): void {
    this.dataSR = {
      columnDefs: this._userService.currentRole === 'USER' ?
        [
          { columnKey: 'tokenId', label: 'TOKEN'},
          { columnKey: 'associated', label: 'Associated', cellTemplate: this.assocCell },
          { columnKey: 'balance', label: 'Token Balance' },
          { columnKey: 'frozen', label: 'Frozen', cellTemplate: this.frozenCell },
          { columnKey: 'kyc', label: 'KYCd', cellTemplate: this.kycCell },
          { columnKey: 'policies', label: 'Policies' },
        ] :
        [
          { columnKey: 'tokenId', label: 'Token Id', cellTemplate: this.tokenIdCellTempl },
          { columnKey: 'tokenName', label: 'Token Name' },
          { columnKey: 'tokenSymbol', label: 'Token Symbol' },
          { columnKey: 'actions', label: 'Users', cellTemplate: this.actionsCellTempl },
        ],
      rowData: []
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.currentPolicy = this._route.snapshot.queryParams['policy'];
    this._route.queryParams.subscribe(queryParams => {
      this.loadProfile();
    });
  }

  loadProfile() {
    this._loader.enable();
    forkJoin([
      this._apiPolicy.all(),
      this.loadTokens()
    ]).pipe(finalize(() => this._loader.disable()))
      .subscribe(([policies, state]) => {
      this.policies = policies;
      // this.loadTokens();
    });
  }

  openDialog(addNewPolicy: TemplateRef<any>) {
    this._dialog.open(addNewPolicy);
    this.initForm();
    this.ft = true;
  }

  private initForm(): void {
    this.dataForm = this._fb.group({
      tokenName: ['Token Name', Validators.required],
      tokenSymbol: ['F', Validators.required],
      tokenType: ['fungible', Validators.required],
      decimals: ['2'],
      initialSupply: ['0'],
      enableAdmin: [false, Validators.required],
      changeSupply: [false, Validators.required],
      enableFreeze: [false, Validators.required],
      enableKYC: [false, Validators.required],
      enableWipe: [false, Validators.required],
    });
  }

  closeDialog(): void {
    this._dialog.closeAll();
    this.dataForm.reset();
    this.ft = true;
  }

  onAsyncError(error: any) {
    // this.informService.processAsyncError(error);
    // this.loading = false;
    this.taskId = undefined;
  }

  loadTokens(policyId?: string, first: boolean = false): Promise<boolean | any> {
    if (!first) this._loader.enable();
    return new Promise( (resolve, reject) => {
      this._apiService.getTokens(this.currentPolicy)
        .pipe(
          catchError((err) => {
            reject(err)
            return throwError(()=> err)
          }),
          untilDestroyed(this),
          finalize(() => {
            if (!first)
            this._loader.disable()
          })
        )
        .subscribe( data => {
          this.dataSR = {
            ...this.dataSR, rowData: data
          }
          resolve(true)
        })
    })
  }

  onFilter() {
    if (this.currentPolicy) {
      this._router.navigate(['/tokens'], {
        queryParams: {
          policy: this.currentPolicy
        }
      });
    } else {
      this._router.navigate(['/tokens']);
    }
    this.loadTokens();
  }

  onAsyncCompleted() {
    if (this.taskId) {
      const taskId = this.taskId;
      const operationMode = this.operationMode;
      this.taskId = undefined;
      this.operationMode = OperationMode.None;
      console.log(operationMode)
      switch (operationMode) {
        case OperationMode.Create:
          this.loadTokens();
          break;
        case OperationMode.Kyc:
          this._taskService.get(taskId).subscribe((task) => {
            // this.loading = false;
            const { result } = task;
            // this.refreshUser(this.user, result);
            // this.user = null;
          });
          this.loadTokens();
          break;
        case OperationMode.Associate:
          this.loadTokens();
          break;
        default:
          console.log('Unsupported operation mode');
      }
    }
  }

  onChangeType() {
    const data = this.dataForm.value;
    this.ft = (data && data.tokenType == 'fungible')
  }

  createToken() {
    if (this.dataForm.valid) {
      const data = this.dataForm.value;
      if (data.tokenType == 'fungible') {
        data.decimals = data.decimals || '0';
        data.initialSupply = '0';
      } else {
        data.decimals = '0';
        data.initialSupply = '0';
      }
      this._dialog.closeAll();
      this._apiService.pushCreate(this.dataForm.value)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.asyncProcess = false)
        )
        .subscribe((result) => {
          this.asyncProcess = true;
          const { taskId, expectation } = result;
          this.taskId = taskId;
          this.expectedTaskMessages = expectation;
          this.operationMode = OperationMode.Create;
        });
    }

  }

  associateHandler(element: ITokenInfo, associate: boolean) {
    if (!element.tokenId) return;
    this._apiService.pushAssociate(element.tokenId, associate).subscribe( result => {
        const { taskId, expectation } = result;
        this.taskId = taskId;
        this.expectedTaskMessages = expectation;
        this.operationMode = OperationMode.Associate;
      }
    )
  }
}

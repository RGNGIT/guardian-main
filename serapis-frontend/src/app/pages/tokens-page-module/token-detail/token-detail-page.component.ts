import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {SettingsService} from "@app/services/setting.service";
import {DataGrid} from "@app/shared/components/data-grid/data-grid.model";
import {ActivatedRoute, Router} from "@angular/router";
import {TokensService} from "@app/services/tokens.service";
import {finalize, of, switchMap} from "rxjs";
import {AuthService} from "@app/services/auth.service";
import {UserService} from "@app/services/user.service";
import {LoaderService} from "@app/services/loader-service";
import {TasksService} from "@app/services/task.service";

enum OperationMode {
  None, Create, Kyc, Associate
}


@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail-page.component.html',
  styleUrls: ['./token-detail-page.component.scss']
})
export class TokenDetailPageComponent implements AfterViewInit, OnInit {
  @ViewChild('actionsCellTempl') actionsCellTempl!: TemplateRef<any>;
  @ViewChild('assocCell', {read:TemplateRef, static: false}) assocCell!: TemplateRef<any>;
  @ViewChild('kycCell', {read:TemplateRef, static: false}) kycCell!: TemplateRef<any>;
  @ViewChild('frozenCell', {read:TemplateRef, static: false}) frozenCell!: TemplateRef<any>;

  data: DataGrid = { columnDefs: [], rowData: [] };
  tokenId!: string;
  users: any[] = [];
  taskId: string | undefined = undefined;
  expectedTaskMessages: number = 0;
  operationMode: OperationMode = OperationMode.None;

  private user: any;

  constructor(
    private _settingService: SettingsService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _taskService: TasksService,
    private _apiService: TokensService,
    private _userService: UserService,
    private _loader: LoaderService
  ) {
  }

  get tokenUrl(): string {
    return this._settingService.getHederaUrl('tokens', '');
  }

  ngAfterViewInit(): void {
    this.data = {
      columnDefs: [
        { columnKey: 'username', label: 'Username' },
        { columnKey: 'associated', label: 'Associated', cellTemplate: this.assocCell },
        { columnKey: 'kyc', label: 'KYCd', cellTemplate: this.kycCell },
        { columnKey: 'balance', label: 'Token Balance' },
        { columnKey: 'frozen', label: 'Frozen', cellTemplate: this.frozenCell },
        { columnKey: 'actions', label: '', cellTemplate: this.actionsCellTempl },
      ],
      rowData: []
    }
  }

  ngOnInit(): void {
    this._loader.enable();
    this._route.paramMap.pipe(
      switchMap(params => {
        this.tokenId = params.get('tokenId') || '';
        return of(this.tokenId);
      })
    ).subscribe(tokenId => {
      this._userService.getUsers().subscribe((users) => {
        this.data = {
          ...this.data, rowData: users.message
        }
        this.refreshAll(this.data.rowData);
        this._loader.disable();
      });
      // this.loadData();
    });
  }

  kyc(user: any, grantKYC: boolean) {
    this._apiService.pushKyc(this.tokenId, user.username, grantKYC).subscribe((result) => {
      this.user = user;
      const { taskId, expectation } = result;
      this.taskId = taskId;
      this.expectedTaskMessages = expectation;
      this.operationMode = OperationMode.Kyc;
    });
  }


  freeze(user: any, freeze: boolean) {
    this._loader.enable();
    this._apiService.freeze(this.tokenId, user.username, freeze).pipe(finalize(() => {
      this._loader.disable();
    })).subscribe((res) => {
      this.refreshUser(user, res);
    });
  }

  refreshUser(user: any, res: any) {
    // user.associated = "n/a";
    // user.balance = "n/a";
    // user.hBarBalance = "n/a";
    // user.frozen = "n/a";
    // user.kyc = "n/a";
    // if (res) {
      user.associated = res.associated;
    //   if (res.associated) {
      user.balance = res.balance;
      user.hBarBalance = res.hBarBalance;
      user.frozen = res.frozen;
      user.kyc = res.kyc;
    //   }
    // }
  }

  refresh(user: any) {
    user.loading = true;
    this._apiService.info(this.tokenId, user.username).subscribe((res) => {
      this.refreshUser(user, res);
      user.loading = false;
    }, (e) => {
      console.error(e.error);
      user.loading = false;
    });
  }


  refreshAll(users: any[]) {
    for (const element of users) {
      this.refresh(element);
    }
  }

  onAsyncError(error: any) {
    // this.informService.processAsyncError(error);
    // this.loading = false;
    this.taskId = undefined;
  }

  onAsyncCompleted() {
    if (this.taskId) {
      const taskId = this.taskId;
      const operationMode = this.operationMode;
      this.taskId = undefined;
      this.operationMode = OperationMode.None;
      switch (operationMode) {
        case OperationMode.Kyc:
          this._taskService.get(taskId).subscribe((task) => {
            const { result } = task;
            this.refreshUser(this.user, result);
            this.user = null;
          });
          break;
          default:
            console.log('Unsupported operation mode');
      }
    }
  }

}

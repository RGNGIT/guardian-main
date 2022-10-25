import {AfterViewInit, Component, OnInit, TemplateRef} from "@angular/core";
import {DataGrid} from "@app/shared/components/data-grid/data-grid.model";
import {PoliciesService} from "@app/services/policies.service";
import {LoaderService} from "@app/services/loader-service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {finalize} from "rxjs";
import {Dialog} from "@angular/cdk/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "@app/services/user.service";

enum OperationMode {
  None,
  Create,
  Import,
  Publish,
  Delete
}

@UntilDestroy()
@Component({
  selector: 'app-policies-page',
  templateUrl: './policies-page.component.html',
  styleUrls: ['./policies-page.component.scss']
})
export class PoliciesPageComponent implements AfterViewInit, OnInit {
  data: DataGrid = { columnDefs: [], rowData: [] };
  dataForm = this._fb.group({
    name: ['', Validators.required],
    description: [''],
    topicDescription: [''],
    policyTag: [`Tag_${Date.now()}`, Validators.required],
  });
  asyncProcess: boolean = false;
  mode: OperationMode = OperationMode.None;
  taskId: string | undefined = undefined;
  expectedTaskMessages: number = 0;

  getFormControlByName(name: string): FormControl {
    // @ts-ignore
    return this.dataForm.controls[name] as FormControl;
  }

  constructor(
    private _policyApi: PoliciesService,
    private _userService: UserService,
    private _loader: LoaderService,
    private _dialog: Dialog,
    private _fb: FormBuilder
  ) {
    this.data = {
      columnDefs: [
        { columnKey: 'id', label: 'ID' },
        { columnKey: 'name', label: 'Policy Name' },
        { columnKey: 'codeVersion', label: 'Version' },
        { columnKey: 'status', label: 'Status' },
        { columnKey: 'description', label: 'Description' }
      ],
      rowData: []
    };
  }

  createPolicy() {
    this.closeDialog();
    this.asyncProcess = true;
    this._policyApi.pushCreate(this.dataForm.value).subscribe((result) => {
      const { taskId, expectation } = result;
      this.taskId = taskId;
      this.expectedTaskMessages = expectation;
      this.mode = OperationMode.Create;
    }, (e) => {
      this.asyncProcess = false;
    });
  }

  ngOnInit() {
    this.loadPolicy();
  }

  private loadPolicy(): void {
    this._loader.enable();
    this._policyApi.getPolicies({page: 0, size: 10})
      .pipe(untilDestroyed(this), finalize(() => this._loader.disable()))
      .subscribe( data => {
        this.data = {...this.data, rowData: data}
      })
  }

  ngAfterViewInit(): void {

  }

  openDialog(addNewPolicy: TemplateRef<any>) {
    this._dialog.open(addNewPolicy);
  }

  closeDialog(): void {
    this._dialog.closeAll();
  }

  onAsyncError(error: any) {
    // this.informService.processAsyncError(error);
    this.taskId = undefined;
    this.mode = OperationMode.None;
    this.loadPolicy();
  }

  onAsyncCompleted() {
    switch (this.mode) {
      case OperationMode.Delete:
      case OperationMode.Create:
      case OperationMode.Import:
        this.taskId = undefined;
        this.mode = OperationMode.None;
        this.loadPolicy();
        break;
      case OperationMode.Publish:
        if (this.taskId) {
          const taskId = this.taskId;
          this.taskId = undefined;
          // todo for publish policy
          // this.processPublishResult(taskId);
        }
        break;
      default:
        console.log(`Not allowed mode ${this.mode}`);
        break;
    }
    this.asyncProcess = false;
    this.mode = OperationMode.None;
  }
}

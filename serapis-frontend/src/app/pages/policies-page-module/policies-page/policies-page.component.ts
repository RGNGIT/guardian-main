import {AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {DataGrid} from "@app/shared/components/data-grid/data-grid.model";
import {PoliciesService} from "@app/services/policies.service";
import {LoaderService} from "@app/services/loader-service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {delay, finalize, take} from "rxjs";
import {Dialog} from "@angular/cdk/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "@app/services/user.service";
import {formatBytes} from  "@app/utils/utils";
import {IPolicy, IPolicyUploadPreview} from "../../../models/policy";
import {TasksService} from "@app/services/task.service";

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
  @ViewChild('fileDropRef') fileDropRef!: ElementRef;
  @ViewChild('setActive') setActiveModal!: TemplateRef<any>;
  @ViewChild('actionsTempl') actionsTempl: any;
  @ViewChild('idCellTempl') idCellTempl: any;
  @ViewChild('nameCellTempl') nameCellTempl: any;
  @ViewChild('codeVersionCellTempl') codeVersionCellTempl: any;
  @ViewChild('statusCellTempl') statusCellTempl: any;
  @ViewChild('descriptionCellTempl') descriptionCellTempl: any;
  data: DataGrid = { columnDefs: [], rowData: [] };
  dataForm = this._fb.group({
    name: ['', Validators.required],
    description: [''],
    topicDescription: [''],
    policyTag: [`Tag_${Date.now()}`, Validators.required],
  });
  fileForm = this._fb.group({
    timestamp: ['', Validators.required]
  });
  asyncProcess: boolean = false;
  mode: OperationMode = OperationMode.None;
  taskId: string | undefined = undefined;
  expectedTaskMessages: number = 0;
  files: any[] = [];
  fileInfo!: IPolicyUploadPreview | null;
  modalLoading = false;
  schemas!: string;
  tokens!: string;
  versionOfTopicId!: string | null;
  policies!: IPolicy[];
  distinctPolicies!: IPolicy[];
  selectedPolicy!: IPolicy | null;
  private fileData: any;
  versionMask = [/\d/, '.', /\d/, '.', /\d/];
  publishVersion: string = '1.0.0';

  getFormControlByName(name: string): FormControl {
    // @ts-ignore
    return this.dataForm.controls[name] as FormControl;
  }

  constructor(
    private _policyApi: PoliciesService,
    private _taskService: TasksService,
    private _userService: UserService,
    private _loader: LoaderService,
    private _dialog: Dialog,
    private _fb: FormBuilder
  ) {

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
        this.policies = data;
        this.distinctPolicies = this.getDistinctPolicy(data);
        this.data = {...this.data, rowData: data}
      })
  }

  ngAfterViewInit(): void {
    this.data = {
      columnDefs: [
        { columnKey: 'id', label: 'ID', cellTemplate: this.idCellTempl },
        { columnKey: 'name', label: 'Policy Name', cellTemplate: this.nameCellTempl },
        { columnKey: 'codeVersion', label: 'Version', cellTemplate: this.codeVersionCellTempl },
        { columnKey: 'status', label: 'Status', cellTemplate: this.statusCellTempl },
        { columnKey: 'description', label: 'Description', cellTemplate: this.descriptionCellTempl },
        { columnKey: 'sctions', label: '', cellTemplate: this.actionsTempl }
      ],
      rowData: []
    };
  }

  openDialog(addNewPolicy: TemplateRef<any>) {
    this._dialog.open(addNewPolicy);
  }

  closeDialog(): void {
    this._dialog.closeAll();
    this.clearUploadInfo();
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
          this.processPublishResult(taskId);
        }
        break;
      default:
        console.log(`Not allowed mode ${this.mode}`);
        break;
    }
    this.asyncProcess = false;
    this.mode = OperationMode.None;
  }

  get fileSwitchDisabled(): boolean {
    // return this.state.state === UploadState.IN_PROGRESS;
    return false;
  }

  openFileDropRef(): void {
    if (this.fileSwitchDisabled) {
      return;
    }
    this.fileDropRef.nativeElement.value = null;
    this.fileDropRef.nativeElement.click();
  }

  onFileDropped($event: any): void {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(target: any): void {
    this.prepareFilesList(target.files);
  }

  prepareFilesList(files: Array<any>): void {
    if (this.files.length !== 0) {
      return;
    }
    if (!this.files.find((file) => file.name === files[0].name)) {
      this.files.push(files[0]);
    }
  }

  formatBytes(bytes: number, decimals: number): string {
    return formatBytes(bytes, decimals);
  }

  deleteFile(index: number): void {
    this.files.splice(index, 1);
  }

  sendFile(): void {
    const reader = new FileReader()
    reader.readAsArrayBuffer(this.files[0]);
    console.log(this.files[0].data)
    reader.addEventListener('load', (e: any) => {
      this.fileData = e.target.result;
      this.modalLoading = true;
      this._policyApi.previewByFile(this.fileData)
        .pipe(
          delay(2000),
          untilDestroyed(this),
          take(1),
          finalize(() => {
            this.modalLoading = false;
          })
        )
        .subscribe((result) => {
          this.fileInfo = result;
          const schemas = result.schemas || [];
          const tokens = result.tokens || [];

          this.schemas = schemas.map((s: any) => {
            if (s.version) {
              return `${s.name} (${s.version})`;
            }
            return s.name;
          }).join(', ');
          this.tokens = tokens.map((s: any) => s.tokenName).join(', ');
        });
    });
  }

  public publish(): void {
    this._policyApi.pushPublish(this.selectedPolicy?.id || '', this.publishVersion)
      .subscribe((result) => {
      this._dialog.closeAll();
      const { taskId, expectation } = result;
      this.taskId = taskId;
      this.expectedTaskMessages = expectation;
      this.mode = OperationMode.Publish;
    });
  }

  importPolicyButtonHandler(): void {
    this.modalLoading = true;
    this._policyApi.pushImportByFile(this.fileData, this.versionOfTopicId || '')
      .pipe(finalize(() => this.modalLoading = false))
      .subscribe( result => {
      const { taskId, expectation } = result;
      this.taskId = taskId;
      this.expectedTaskMessages = expectation;
      this.mode = OperationMode.Import;
      this._dialog.closeAll();
      this.clearUploadInfo();
    });
  }

  private getDistinctPolicy(policies: IPolicy[]): any[] {
    const policyByTopic: any = {};
    if (policies) {
      for (let i = 0; i < policies.length; i++) {
        const policy = policies[i];
        if (policy.topicId) {
          if (!policyByTopic.hasOwnProperty(policy.topicId)) {
            policyByTopic[policy.topicId] = policy;
          } else if (policyByTopic[policy.topicId].createDate > policy.createDate) {
            policyByTopic[policy.topicId] = policy;
          }
        }
      }
    }
    return Object.values(policyByTopic)
      .sort((a: any, b: any) => a.createDate > b.createDate ? -1 : (b.createDate > a.createDate ? 1 : 0));
  }

  clearUploadInfo(): void {
    this.modalLoading = false;
    this.fileData = null;
    this.fileInfo = null;
    this.files = [];
    this.versionOfTopicId = null;
  }

  setPolicyActive(element: IPolicy) {
    this.selectedPolicy = element;
    this._dialog.open(this.setActiveModal);
  }

  private processPublishResult(taskId: string): void {
    this._taskService.get(taskId).subscribe((task: any) => {
      const { result } = task;
      if (result) {
        const { isValid, errors } = result;
        if (!isValid) {
          let text = [];
          const blocks = errors.blocks;
          const invalidBlocks = blocks.filter(
            (block: any) => !block.isValid
          );
          for (let i = 0; i < invalidBlocks.length; i++) {
            const block = invalidBlocks[i];
            for (
              let j = 0;
              j < block.errors.length;
              j++
            ) {
              const error = block.errors[j];
              text.push(
                `<div>${block.id}: ${error}</div>`
              );
            }
          }
          // this.toastr.error(
          //   text.join(''),
          //   'The policy is invalid',
          //   {
          //     timeOut: 30000,
          //     closeButton: true,
          //     positionClass: 'toast-bottom-right',
          //     enableHtml: true,
          //   }
          // );
        }
        this.loadPolicy();
      }
    });
  }

  deletePolicy() {
    this._policyApi.pushDelete(this.selectedPolicy?.id || '').subscribe((result) => {
      this._dialog.closeAll();
      const { taskId, expectation } = result;
      this.taskId = taskId;
      this.expectedTaskMessages = expectation;
      this.mode = OperationMode.Delete;
    });
  }

  setDryRun(element: IPolicy) {
    this._policyApi.dryRun(element.id).subscribe((data: any) => {
      const { policies, isValid, errors } = data;
      if (!isValid) {
        let text = [];
        const blocks = errors.blocks;
        const invalidBlocks = blocks.filter((block: any) => !block.isValid);
        for (let i = 0; i < invalidBlocks.length; i++) {
          const block = invalidBlocks[i];
          for (let j = 0; j < block.errors.length; j++) {
            const error = block.errors[j];
            text.push(`<div>${block.id}: ${error}</div>`);
          }
        }
        // this.toastr.error(text.join(''), 'The policy is invalid', {
        //   timeOut: 30000,
        //   closeButton: true,
        //   positionClass: 'toast-bottom-right',
        //   enableHtml: true
        // });
      }
      this.loadPolicy();
    });
  }

  stop(element: any) {
    this._policyApi.draft(element.id).subscribe((data: any) => {
      const { policies, isValid, errors } = data;
      this.loadPolicy();
    });
  }
}

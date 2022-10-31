import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpResponse } from '@angular/common/http';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { forkJoin, of } from 'rxjs';

import { ISchema, Schema } from '@app/models/schema';
import { UserService } from '@app/services/user.service';
import { PoliciesService } from '@app/services/policies.service';
import { SchemasService } from '@app/services/schemas.service';
import { SchemaHelper } from '@app/utils/scheme-helper';

import { SchemaDialogComponent } from '../schema-dialog/schema-dialog.component';
import { SetVersionDialogComponent } from '../set-version-dialog/set-version-dialog.component';
import { LoaderService } from '@app/services/loader-service';
import { VcDialogComponent } from '../vc-dialog/vc-dialog.component';
import { ExportSchemaDialogComponent } from '../export-schema-dialog/export-schema-dialog.component';
import { SchemaViewDialogComponent } from '../schema-view-dialog/schema-view-dialog.component';
import { ImportSchemaDialogComponent } from '../import-schema-dialog/import-schema-dialog.component';
import { ConfirmationDialogComponent } from '@app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-schemas-page',
  templateUrl: './schemas-page.component.html',
  styleUrls: ['./schemas-page.component.scss']
})
export class SchemasPageComponent implements OnInit {
  @ViewChild('actionsColumnCellTemplate') actionsColumnCellTemplate: any;
  @ViewChild('statusColumnCellTemplate') statusColumnCellTemplate: any;
  @ViewChild('operationColumnCellTemplate') operationColumnCellTemplate: any;
  @ViewChild('policyColumnCellTemplate') policyColumnCellTemplate: any;
  @ViewChild('topicColumnCellTemplate') topicColumnCellTemplate: any;

  data: { columnDefs: []; rowData: [] } = { columnDefs: [], rowData: [] };
  schemasMap: any;
  system: boolean = true;
  schemas: Schema[] = [];
  currentTopicPolicy: any = '';
  policies: any[] | null | undefined;
  pageIndex: number;
  pageSize: number;
  policyNameByTopic: any;
  isConfirmed: boolean = false;
  schemasCount: any;
  taskId: string | undefined = undefined;
  expectedTaskMessages: number = 0;

  systemSchemaColumns: any = [];
  policySchemaColumns: any = [];

  constructor(
    private schemaService: SchemasService,
    private userService: UserService,
    private policyService: PoliciesService,
    private _loader: LoaderService,
    public dialog: MatDialog
  ) {
    this.pageIndex = 0;
    this.pageSize = 100;
    this.policyNameByTopic = {};
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngAfterViewInit() {
    this.systemSchemaColumns = [
      { columnKey: 'name', label: 'Name' },
      { columnKey: 'owner', label: 'Owner' },
      { columnKey: 'entity', label: 'Entity' },
      {
        columnKey: 'status',
        label: 'Status',
        cellTemplate: this.statusColumnCellTemplate
      },
      {
        columnKey: 'operations',
        label: 'Operations',
        cellTemplate: this.operationColumnCellTemplate
      },
      {
        columnKey: 'actions',
        label: 'Actions',
        cellTemplate: this.actionsColumnCellTemplate
      }
    ];
    this.policySchemaColumns = [
      {
        columnKey: 'policy',
        label: 'Policy',
        cellTemplate: this.policyColumnCellTemplate
      },
      { columnKey: 'name', label: 'Name' },
      {
        columnKey: 'topic',
        label: 'Topic',
        cellTemplate: this.topicColumnCellTemplate
      },
      { columnKey: 'version', label: 'Version' },
      { columnKey: 'entity', label: 'Entity' },
      {
        columnKey: 'status',
        label: 'Status',
        cellTemplate: this.statusColumnCellTemplate
      },
      {
        columnKey: 'operations',
        label: 'Operations',
        cellTemplate: this.operationColumnCellTemplate
      },
      {
        columnKey: 'actions',
        label: 'Actions',
        cellTemplate: this.actionsColumnCellTemplate
      }
    ];
  }

  handleChangeSchemasType(event: MatButtonToggleChange) {
    this.system = event.value === 'system';
    this.loadSchemas();
  }

  loadProfile() {
    // this.loading = true;
    forkJoin([
      of(this.userService.getProfile()),
      this.policyService.all()
    ]).subscribe(
      (value: any) => {
        // this.loading = false;

        const profile: any | null = value[0];
        const policies: any[] = value[1] || [];

        this.isConfirmed = !!(profile && profile.confirmed);
        if (!this.isConfirmed) {
          this.system = true;
        }
        this.policyNameByTopic = {};
        this.policies = [];
        for (let i = 0; i < policies.length; i++) {
          const policy = policies[i];
          if (
            policy.topicId &&
            !this.policyNameByTopic.hasOwnProperty(policy.topicId)
          ) {
            this.policyNameByTopic[policy.topicId] = policy.name;
            this.policies.push(policy);
          }
        }

        if (!this.policyNameByTopic[this.currentTopicPolicy]) {
          this.currentTopicPolicy = undefined;
        }

        this.pageIndex = 0;
        this.pageSize = 100;
        this.loadSchemas();
      },
      (error: any) => {
        // this.loading = false;
        console.error(error);
      }
    );
  }

  loadSchemas() {
    this._loader.enable();
    const request = this.system
      ? this.schemaService.getSystemSchemas(this.pageIndex, this.pageSize)
      : this.schemaService.getSchemasByPage(
          this.currentTopicPolicy,
          this.pageIndex,
          this.pageSize
        );
    request.subscribe(
      (schemasResponse: HttpResponse<ISchema[]>) => {
        this.schemas = SchemaHelper.map(schemasResponse.body || []);
        this.schemasCount =
          schemasResponse.headers.get('X-Total-Count') || this.schemas.length;
        this.schemaMapping(this.schemas);

        let schemasData: any = {
          columnDefs: this.system
            ? this.systemSchemaColumns
            : this.policySchemaColumns,
          rowData: []
        };
        for (let i = 0; i < this.schemas.length; i++) {
          schemasData.rowData.push(this.schemas[i]);
        }
        this.data = { ...schemasData };

        this._loader.disable();
        setTimeout(() => {
          // this.loading = false;
        }, 500);
      },
      (e: { error: any }) => {
        console.error(e.error);
        // this.loading = false;
      }
    );
  }

  schemaMapping(schemas: ISchema[]) {
    this.schemasMap = {};
    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i];
      if (schema.topicId) {
        if (this.schemasMap[schema.topicId]) {
          this.schemasMap[schema.topicId].push(schema);
        } else {
          this.schemasMap[schema.topicId] = [schema];
        }
      }
    }
  }

  handleAddNewSchema() {
    const dialogRef = this.dialog.open(SchemaDialogComponent, {
      width: '950px',
      panelClass: 'g-dialog',
      disableClose: true,
      data: {
        system: this.system,
        type: 'new',
        schemasMap: this.schemasMap,
        topicId: this.currentTopicPolicy,
        policies: this.policies
      }
    });
    dialogRef.afterClosed().subscribe(async (schema: Schema | null) => {
      if (schema) {
        // this.loading = true;
        if (schema.system) {
          this.schemaService.createSystemSchemas(schema).subscribe(
            (data: any) => {
              this.loadSchemas();
            },
            (e: { error: any }) => {
              console.error(e.error);
              // this.loading = false;
            }
          );
        } else {
          this.schemaService.pushCreate(schema, schema.topicId).subscribe(
            (result: any) => {
              const { taskId, expectation } = result;
              this.taskId = taskId;
              this.expectedTaskMessages = expectation;
            },
            (e: any) => {
              // this.loading = false;
              this.taskId = undefined;
            }
          );
        }
      }
    });
  }

  handleEditSchema(element: Schema) {
    const dialogRef = this.dialog.open(SchemaDialogComponent, {
      width: '950px',
      panelClass: 'g-dialog',
      disableClose: true,
      data: {
        type: 'edit',
        schemasMap: this.schemasMap,
        topicId: this.currentTopicPolicy,
        policies: this.policies,
        scheme: element
      }
    });
    dialogRef.afterClosed().subscribe(async (schema: Schema | null) => {
      if (schema) {
        // this.loading = true;

        const request = this.system
          ? this.schemaService.updateSystemSchemas(schema, element.id)
          : this.schemaService.update(schema, element.id);
        request.subscribe(
          data => {
            this.loadSchemas();
          },
          (e: { error: any }) => {
            console.error(e.error);
            // this.loading = false;
          }
        );
      }
    });
  }

  handleNewVersionSchema(element: Schema) {
    const dialogRef = this.dialog.open(SchemaDialogComponent, {
      width: '950px',
      panelClass: 'g-dialog',
      disableClose: true,
      data: {
        type: 'version',
        schemasMap: this.schemasMap,
        topicId: this.currentTopicPolicy,
        policies: this.policies,
        scheme: element
      }
    });
    dialogRef.afterClosed().subscribe(async (schema: Schema | null) => {
      if (schema) {
        // this.loading = true;
        this.schemaService.newVersion(schema, element.id).subscribe(
          result => {
            const { taskId, expectation } = result;
            this.taskId = taskId;
            this.expectedTaskMessages = expectation;
          },
          () => {
            // this.loading = false;
            this.taskId = undefined;
          }
        );
      }
    });
  }

  handleCloneSchema(element: Schema) {
    const newDocument: any = { ...element };
    delete newDocument._id;
    delete newDocument.id;
    delete newDocument.uuid;
    delete newDocument.creator;
    delete newDocument.owner;
    delete newDocument.version;
    delete newDocument.previousVersion;
    const dialogRef = this.dialog.open(SchemaDialogComponent, {
      width: '950px',
      panelClass: 'g-dialog',
      disableClose: true,
      data: {
        type: 'version',
        schemasMap: this.schemasMap,
        topicId: this.currentTopicPolicy,
        policies: this.policies,
        scheme: newDocument
      }
    });
    dialogRef.afterClosed().subscribe(async (schema: Schema | null) => {
      if (schema) {
        // this.loading = true;
        this.schemaService.pushCreate(schema, schema.topicId).subscribe(
          result => {
            const { taskId, expectation } = result;
            this.taskId = taskId;
            this.expectedTaskMessages = expectation;
          },
          e => {
            // this.loading = false;
            this.taskId = undefined;
          }
        );
      }
    });
  }

  handleDeleteSchema(element: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        dialogTitle: 'Delete schema',
        dialogText: 'Are you sure to delete schema?'
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      // this.loading = true;
      const request = this.system
        ? this.schemaService.deleteSystemSchemas(element.id)
        : this.schemaService.delete(element.id);

      request.subscribe(
        (data: any) => {
          const schemas = SchemaHelper.map(data);
          this.schemaMapping(schemas);
          this.loadSchemas();
        },
        () => {
          // this.loading = false;
        }
      );
    });
  }

  active(element: any) {
    // this.loading = true;
    this.schemaService.activeSystemSchemas(element.id).subscribe(
      res => {
        // this.loading = false;
        this.loadSchemas();
      },
      e => {
        // this.loading = false;
      }
    );
  }

  publish(element: any) {
    const dialogRef = this.dialog.open(SetVersionDialogComponent, {
      width: '350px',
      disableClose: true,
      data: {
        schemas: this.schemas
      }
    });
    dialogRef.afterClosed().subscribe(async version => {
      if (version) {
        // this.loading = true;
        this.schemaService.pushPublish(element.id, version).subscribe(
          result => {
            const { taskId, expectation } = result;
            this.taskId = taskId;
            this.expectedTaskMessages = expectation;
          },
          e => {
            // this.loading = false;
            this.taskId = undefined;
          }
        );
      }
    });
  }

  async importSchemas(messageId?: string) {
    const dialogRef = this.dialog.open(ImportSchemaDialogComponent, {
      width: '500px',
      autoFocus: false,
      data: { timeStamp: messageId }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        this.importSchemasDetails(result);
      }
    });
  }

  importSchemasDetails(result: any) {
    const { type, data, schemas } = result;
    const dialogRef = this.dialog.open(SchemaViewDialogComponent, {
      width: '950px',
      height: '900px',
      panelClass: 'g-dialog',
      data: {
        schemas: schemas,
        topicId: this.currentTopicPolicy,
        policies: this.policies
      }
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result && result.messageId) {
        this.importSchemas(result.messageId);
        this.loadSchemas();
        return;
      }

      if (result && result.topicId) {
        // this.loading = true;
        if (type == 'message') {
          this.schemaService
            .pushImportByMessage(data, result.topicId)
            .subscribe(result => {
              const { taskId, expectation } = result;
              this.taskId = taskId;
              this.expectedTaskMessages = expectation;
              this.loadSchemas();
            });
        } else if (type == 'file') {
          this.schemaService
            .pushImportByFile(data, result.topicId)
            .subscribe(result => {
              const { taskId, expectation } = result;
              this.taskId = taskId;
              this.expectedTaskMessages = expectation;
              this.loadSchemas();
            });
        }
      }
    });
  }

  handleExportSchema(element: any) {
    this.schemaService.exportInMessage(element.id).subscribe(schema =>
      this.dialog.open(ExportSchemaDialogComponent, {
        width: '700px',
        panelClass: 'g-dialog',
        data: {
          schema: schema
        },
        autoFocus: false
      })
    );
  }

  handleOpenDocument(element: Schema) {
    const dialogRef = this.dialog.open(VcDialogComponent, {
      width: '850px',
      data: {
        document: element.document,
        title: 'Schema',
        type: 'JSON'
      }
    });
    dialogRef.afterClosed().subscribe(async result => {});
  }

  onAsyncError(error: any) {
    // this.informService.processAsyncError(error);
    // this.loading = false;
    this.taskId = undefined;
  }

  onAsyncCompleted() {
    this.taskId = undefined;
    this.loadSchemas();
  }
}

import {Component, Inject, OnInit} from '@angular/core';
import {ImportType} from "@app/models/schema";
import {FormBuilder, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SchemasService} from "@app/services/schemas.service";
import {TasksService} from "@app/services/task.service";

@Component({
  selector: 'app-import-schema-dialog',
  templateUrl: './import-schema-dialog.component.html',
  styleUrls: ['./import-schema-dialog.component.scss']
})
export class ImportSchemaDialogComponent implements OnInit {
  importType?: ImportType;
  dataForm = this.fb.group({
    timestamp: ['', Validators.required]
  });
  loading: boolean = false;

  taskId: string | undefined = undefined;
  expectedTaskMessages: number = 0;

  public isImportTypeSelected: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ImportSchemaDialogComponent>,
    private fb: FormBuilder,
    private schemaService: SchemasService,
    // private informService: InformService,
    private taskService: TasksService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.timeStamp) {
      this.importType = ImportType.IPFS;
      this.isImportTypeSelected = true;
      this.dataForm.patchValue({
        timestamp: data.timeStamp
      });
      this.importFromMessage();
    }
  }

  setImportType(importType: ImportType) {
    this.importType = importType;
    this.isImportTypeSelected = true;
  }

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  importFromMessage() {
    if (!this.dataForm.valid) {
      return;
    }

    this.loading = true;
    const messageId = this.dataForm.get('timestamp')?.value;

    this.schemaService.pushPreviewByMessage(messageId).subscribe((result: any) => {
      const { taskId, expectation } = result;
      this.taskId = taskId;
      this.expectedTaskMessages = expectation;
    }, (e) => {
      this.loading = false;
      this.taskId = undefined;
    });
  }

  onAsyncError(error: any) {
    // this.informService.processAsyncError(error);
    this.loading = false;
    this.taskId = undefined;
  }

  onAsyncCompleted() {
    if (this.taskId) {
      const taskId: string = this.taskId;
      this.taskId = undefined;
      this.taskService.get(taskId).subscribe((task: any) => {
        this.loading = false;
        const { result } = task;
        this.dialogRef.close({
          type: 'message',
          data: this.dataForm.get('timestamp')?.value,
          schemas: result
        });
      }, (e) => {
        this.loading = false;
      });
    }
  }

  importFromFile(file: any) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('load', (e: any) => {
      const arrayBuffer = e.target.result;
      this.loading = true;
      this.schemaService.previewByFile(arrayBuffer).subscribe((result: any) => {
        this.loading = false;
        this.dialogRef.close({
          type: 'file',
          data: arrayBuffer,
          schemas: result
        });
      }, () => {
        this.loading = false;
      });
    });
  }

  ngOnInit(): void {
  }
}

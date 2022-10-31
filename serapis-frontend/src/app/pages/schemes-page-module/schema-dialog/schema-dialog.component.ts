import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { SchemaConfigurationComponent } from '../schema-configuration/schema-configuration.component';
import { Schema } from '@app/models/schema';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-schema-dialog',
  templateUrl: './schema-dialog.component.html',
  styleUrls: ['./schema-dialog.component.scss']
})
export class SchemaDialogComponent implements OnInit {
  @ViewChild('document') schemaControl!: SchemaConfigurationComponent;

  scheme: Schema;
  schemasMap: any;
  started: boolean = false;
  type: 'new' | 'edit' | 'version' = 'new';
  topicId: any;
  policies: any[];
  system: boolean = false;
  valid: boolean = true;
  extended: boolean = false;
  fields: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<SchemaDialogComponent>,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.schemasMap = data.schemasMap || {};
    this.scheme = data.scheme || null;
    this.type = data.type || null;
    this.topicId = data.topicId || null;
    this.policies = data.policies || [];
    this.system = data.system || false;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.started = true;
    });
  }

  getDocument(schema: Schema | null) {
    this.dialogRef.close(schema);
  }

  onClose() {
    this.dialogRef.close(null);
  }

  onCreate() {
    const schema = this.schemaControl?.getSchema();
    this.dialogRef.close(schema);
  }

  onChangeForm(schemaControl: SchemaConfigurationComponent) {
    this.valid = schemaControl.isValid();
  }

  onChangeFields(fields: any[]) {
    this.fields = fields;
    this.cdr.detectChanges();
  }

  drop(event: any) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  handleChangeSchemaExtended(event: MatButtonToggleChange) {
    this.extended = event.value === 'extended';
  }
}

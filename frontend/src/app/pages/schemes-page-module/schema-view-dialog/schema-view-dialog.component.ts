import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-schema-view-dialog',
  templateUrl: './schema-view-dialog.component.html',
  styleUrls: ['./schema-view-dialog.component.scss']
})
export class SchemaViewDialogComponent implements OnInit {

  loading = true;
  schemas!: any[];
  topicId: any;
  policies: any[];

  constructor(
    public dialogRef: MatDialogRef<SchemaViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.schemas = this.data.schemas || [];
    this.topicId = this.data.topicId || null;
    this.policies = this.data.policies || [];
  }

  ngOnInit() {
    this.loading = false;
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onImport() {
    this.dialogRef.close({ topicId: this.topicId });
  }

  onNewVersionClick(messageId: string) {
    this.dialogRef.close({ messageId });
  }
}

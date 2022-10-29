import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-vc-dialog',
  templateUrl: './vc-dialog.component.html',
  styleUrls: ['./vc-dialog.component.scss']
})
export class VcDialogComponent implements OnInit {
  title: string = "";
  json: string = "";
  viewDocument!: any;
  isVcDocument!: boolean;
  document: any;
  type: any;
  isVpDocument!: boolean;
  isJsonDocument!: boolean;

  constructor(
    public dialogRef: MatDialogRef<VcDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      document: any,
      title: string,
      viewDocument?: boolean,
      type?: 'VC' | 'VP' | 'JSON'
    }) {
  }

  ngOnInit() {
    const {
      document,
      title,
      viewDocument,
      type
    } = this.data;
    this.title = title;
    this.json = JSON.stringify((document), null, 4);
    this.document = document;
    this.type = type || 'JSON';

    this.isVcDocument = false;
    this.isVpDocument = false;
    this.isJsonDocument = false;
    if (this.type == 'VC') {
      this.isVcDocument = true;
    } else if (this.type == 'VP') {
      this.isVpDocument = true;
    } else {
      this.isJsonDocument = true;
    }
    this.viewDocument = (viewDocument || false) && (this.isVcDocument || this.isVpDocument);
  }

  onClick(): void {
    this.dialogRef.close(null);
  }
}

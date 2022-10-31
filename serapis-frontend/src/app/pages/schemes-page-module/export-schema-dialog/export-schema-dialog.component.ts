import {Component, Inject, OnInit} from '@angular/core';
import {SchemasService} from "@app/services/schemas.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-export-schema-dialog',
  templateUrl: './export-schema-dialog.component.html',
  styleUrls: ['./export-schema-dialog.component.scss']
})
export class ExportSchemaDialogComponent implements OnInit {
  loading = true;

  schema!: any;

  constructor(
    public dialogRef: MatDialogRef<ExportSchemaDialogComponent>,
    private schemaService: SchemasService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.schema = data.schema;
  }

  ngOnInit() {
    this.loading = false;
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  saveToFile() {
    this.loading = true;
    this.schemaService.exportInFile(this.schema.id)
      .subscribe((fileBuffer) => {
        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob([new Uint8Array(fileBuffer)], {
          type: 'application/guardian-schema'
        }));
        downloadLink.setAttribute('download', `schemas_${Date.now()}.schema`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        setTimeout(() => {
          this.loading = false;
        }, 500);
      }, error => {
        this.loading = false;
      });
  }
}

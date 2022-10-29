import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-set-version-dialog',
  templateUrl: './set-version-dialog.component.html',
  styleUrls: ['./set-version-dialog.component.scss']
})
export class SetVersionDialogComponent implements OnInit {
  versionControl: FormControl = new FormControl(
    '',
    Validators.pattern(/^[\d]+([\\.][\d]+){0,2}$/)
  );

  constructor(
    public dialogRef: MatDialogRef<SetVersionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close(null);
  }

  onSubmit() {
    this.dialogRef.close(this.versionControl.value);
  }
}

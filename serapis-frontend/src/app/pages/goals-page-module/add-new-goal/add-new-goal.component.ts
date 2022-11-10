import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-new-goal',
  templateUrl: './add-new-goal.component.html',
  styleUrls: ['./add-new-goal.component.scss']
})
export class AddNewGoalComponent implements OnInit {
  addingMode: boolean = true;
  formValid: boolean = true;
  dataForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddNewGoalComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const goal = this.data?.goal || {};
    this.addingMode = this.data.addingMode;

    this.dataForm = this.fb.group({
      reportingDateFrom: [goal.reportDateFrom || null, Validators.required],
      reportingDateTo: [goal.reportDateTo || null, Validators.required],
      comparisonDateFrom: [
        goal.comparisonDateFrom || null,
        Validators.required
      ],
      comparisonDateTo: [goal.comparisonDateTo || null, Validators.required],
      comparisonEmissions: [goal.comparisonEmissions || 0, Validators.required],
      removal: [goal.removal || 0, Validators.required],
      reduction: [goal.reduction || 0, Validators.required],
      goalEmissions: [goal.goalEmissions || 0, Validators.required],
      totalRemoval: [goal.totalRemoval || 0, Validators.required]
    });

    this.formValid = this.dataForm.valid;

    this.dataForm.valueChanges.subscribe(() => {
      this.formValid = this.dataForm.valid;
    });
  }

  handleCloseDialog() {
    this.dialogRef.close(null);
  }

  handleCreateGoal() {
    this.dialogRef.close(this.dataForm.value);
  }
}

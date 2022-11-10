import { Component, OnInit, ViewChild } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { AddNewGoalComponent } from '../add-new-goal/add-new-goal.component';
import { Goal } from '@app/models/goal';
import { GoalsService } from '@app/services/goals.service';
import { UserService } from '@app/services/user.service';
import { of } from 'rxjs';
import { LoaderService } from '@app/services/loader-service';

@Component({
  selector: 'app-goals-page',
  templateUrl: './goals-page.component.html',
  styleUrls: ['./goals-page.component.scss']
})
export class GoalsPageComponent implements OnInit {
  @ViewChild('actionsColumnCellTemplate') actionsColumnCellTemplate: any;

  data: any = { columnDefs: [], rowData: [] };
  topicId: string = '';
  userDid: string = '';

  constructor(
    public dialog: MatDialog,
    private goalsService: GoalsService,
    private userService: UserService,
    private _loader: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.getGoalsList();
  }

  loadProfile() {
    of(this.userService.getProfile()).subscribe((profile: any) => {
      this.topicId = profile.topicId;
      this.userDid = profile.did;
    });
  }

  getGoalsList() {
    this._loader.enable();
    this.goalsService.getGoalsList(0, 100).subscribe((response: any) => {
      let goals: any = {};
      goals.columnDefs = [
        { columnKey: 'goalId', label: 'Goal ID' },
        { columnKey: 'reportingPeriod', label: 'Reporting Period' },
        { columnKey: 'comparisonPeriod', label: 'Comparison Period' },
        {
          columnKey: 'comparisonEmissions',
          label: 'Comparison Emissions, tons'
        },
        { columnKey: 'removal', label: 'Removal, tons' },
        { columnKey: 'reduction', label: 'Reduction, tons' },
        { columnKey: 'goalEmissions', label: 'Goal Emissions, tons' },
        { columnKey: 'totalRemoval', label: 'Total Removal, %' },
        {
          columnKey: 'action',
          label: ' ',
          cellTemplate: this.actionsColumnCellTemplate
        }
      ];

      goals.rowData = [];
      for (const goal of response.body) {
        goals.rowData.push({
          goalId: goal.id,
          reportingPeriod:
            new Date(goal.reportDateFrom).toLocaleString('en-US') +
            ' - ' +
            new Date(goal.reportDateTo).toLocaleDateString('en-US'),
          reportDateFrom: goal.reportDateFrom,
          reportDateTo: goal.reportDateTo,
          comparisonPeriod:
            new Date(goal.comparisonDateFrom).toLocaleDateString('en-US') +
            ' - ' +
            new Date(goal.comparisonDateTo).toLocaleDateString('en-US'),
          comparisonDateFrom: goal.comparisonDateFrom,
          comparisonDateTo: goal.comparisonDateTo,
          comparisonEmissions: goal.comparisonEmissions,
          removal: goal.removal,
          reduction: goal.reduction,
          goalEmissions: goal.goalEmissions,
          totalRemoval: goal.totalRemoval,
          action: ''
        });
      }

      this.data = { ...goals };

      this._loader.disable();
    });
  }

  handleAddNewGoal() {
    const dialogRef = this.dialog.open(AddNewGoalComponent, {
      width: '600px',
      height: '55vh',
      disableClose: true,
      data: {
        addingMode: true
      }
    });
    dialogRef.afterClosed().subscribe(async (goal: any) => {
      const newGoal = {
        topicId: this.topicId,
        userDid: this.userDid,
        reportDateFrom: goal.reportingDateFrom,
        reportDateTo: goal.reportingDateTo,
        comparisonDateFrom: goal.comparisonDateFrom,
        comparisonDateTo: goal.comparisonDateTo,
        comparisonEmissions: +goal.comparisonEmissions,
        removal: +goal.removal,
        reduction: +goal.reduction,
        goalEmissions: +goal.goalEmissions,
        totalRemoval: +goal.totalRemoval
      };
      this.goalsService.addNewGoal(newGoal).subscribe((response: any) => {
        this.getGoalsList();
      });
    });
  }

  handleEditGoal(goal: any) {
    const dialogRef = this.dialog.open(AddNewGoalComponent, {
      width: '600px',
      height: '55vh',
      disableClose: true,
      data: {
        goal: goal,
        addingMode: false
      }
    });
    dialogRef.afterClosed().subscribe(async (newGoal: any) => {
      console.log(newGoal);

      const newVersionOfGoal = {
        topicId: this.topicId,
        userDid: this.userDid,
        id: goal.goalId,
        reportDateFrom: newGoal.reportingDateFrom,
        reportDateTo: newGoal.reportingDateTo,
        comparisonDateFrom: newGoal.comparisonDateFrom,
        comparisonDateTo: newGoal.comparisonDateTo,
        comparisonEmissions: +newGoal.comparisonEmissions,
        removal: +newGoal.removal,
        reduction: +newGoal.reduction,
        goalEmissions: +newGoal.goalEmissions,
        totalRemoval: +newGoal.totalRemoval
      };
      this.goalsService
        .updateGoal(newVersionOfGoal)
        .subscribe((response: any) => {
          this.getGoalsList();
        });
    });
  }
}

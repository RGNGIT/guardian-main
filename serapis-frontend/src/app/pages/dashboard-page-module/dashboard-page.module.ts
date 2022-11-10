import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgForOf } from '@angular/common';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { MatRadioModule } from '@angular/material/radio';
import { NgxFileDropModule } from 'ngx-file-drop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SettingsService } from '@app/services/settings.service';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '@app/shared/shared.module';
import { MatNativeDateModule } from '@angular/material/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GoalsService } from '@app/services/goals.service';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

const components = [DashboardComponent];

@NgModule({
  declarations: [...components],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    NgForOf,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatRadioModule,
    NgxFileDropModule,
    CommonModule,
    MatDatepickerModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    ClipboardModule,
    FormsModule,
    MatNativeDateModule
  ],
  providers: [SettingsService, GoalsService],
  exports: [...components],
  bootstrap: []
})
export class DashboardPageModule {}

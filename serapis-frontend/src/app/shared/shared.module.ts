import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { AsyncProgressComponent } from '@app/shared/components/async-progress/async-progress.component';
import { BaseDialogComponent } from '@app/shared/components/base-dialog/base-dialog.component';
import { ConfirmationDialogComponent } from '@app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { DataGridComponent } from '@app/shared/components/data-grid/data-grid.component';
import { DragonglassComponent } from '@app/shared/components/dragonglass/dragonglass.component';
import { FileDragNDropComponent } from '@app/shared/components/file-grad-n-drop/file-drag-n-drop.component';
import { SchemaFormComponent } from '@app/shared/components/schema-form-component/schema-form.component';
import { SerapisButton } from '@app/shared/components/serapis-button/serapis.button';
import { SerapisContainerComponent } from '@app/shared/components/serapis-container/serapis-container.component';
import { SerapisLinkComponent } from '@app/shared/components/serapis-link/serapis-link.component';
import { SharedTooltipComponent } from '@app/shared/components/shared-tooltip/shared-tooltip.component';
import { DndDirective } from '@app/shared/direcives/dnd.directive';
import { IsRoleAllowDirective } from '@app/shared/direcives/is-role-allow.directive';
import { SharedTooltipDirective } from '@app/shared/direcives/shared-tooltip.directive';
import { NgxFileDropModule } from 'ngx-file-drop';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';

const MATERIAL_MODULES = [
  MatTableModule,
  MatSortModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatRadioModule,
  MatDatepickerModule,
  MatInputModule,
  MatButtonModule,
  MatProgressBarModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatSnackBarModule
];

const SHARED_DIRECTIVES = [
  SharedTooltipDirective,
  DndDirective,
  IsRoleAllowDirective
];

const SHARED_COMPONENTS = [
  SerapisButton,
  SerapisLinkComponent,
  SerapisContainerComponent,

  SharedTooltipComponent,
  DataGridComponent,
  SchemaFormComponent,
  AsyncProgressComponent,
  BaseDialogComponent,
  ConfirmationDialogComponent,
  DragonglassComponent,
  FileDragNDropComponent,
  NotificationToastComponent
];

@NgModule({
  declarations: [...SHARED_COMPONENTS, ...SHARED_DIRECTIVES],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,

    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxFileDropModule,

    ...MATERIAL_MODULES
  ],
  exports: [...SHARED_COMPONENTS, ...SHARED_DIRECTIVES]
})
export class SharedModule {}

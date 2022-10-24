import {NgModule} from "@angular/core";
import {SerapisButton} from "@app/shared/components/serapis-button/serapis.button";
import {SerapisLinkComponent} from "@app/shared/components/serapis-link/serapis-link.component";
import {NgClass, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
import {SerapisContainerComponent} from "@app/shared/components/serapis-container/serapis-container.component";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MatIconModule} from "@angular/material/icon";
import { DataGridComponent } from './components/data-grid/data-grid.component';
import {SharedTooltipDirective} from "@app/shared/direcives/shared-tooltip.directive";
import {SharedTooltipComponent} from "@app/shared/components/shared-tooltip/shared-tooltip.component";
import { CommonModule} from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import {SchemaFormComponent} from "@app/shared/components/schema-form-component/schema-form.component";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatRadioModule} from "@angular/material/radio";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgxMatDatetimePickerModule, NgxMatTimepickerModule} from "@angular-material-components/datetime-picker";
import {MatButtonModule} from "@angular/material/button";
import {AsyncProgressComponent} from "@app/shared/components/async-progress/async-progress.component";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatListModule} from "@angular/material/list";
import {BaseDialogComponent} from "@app/shared/components/base-dialog/base-dialog.component";

const components = [
  SerapisButton,
  SerapisLinkComponent,
  SerapisContainerComponent,
  SharedTooltipDirective,
  SharedTooltipComponent,
  DataGridComponent,
  SchemaFormComponent,
  AsyncProgressComponent,
  BaseDialogComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    NgClass,
    MatTableModule,
    CommonModule,
    MatSortModule,
    NgIf,
    ClipboardModule,
    MatIconModule,
    NgStyle,
    NgTemplateOutlet,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatRadioModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    NgxMatDatetimePickerModule,
    MatDatepickerModule,
    MatInputModule,
    NgxMatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgxMatDatetimePickerModule,
    MatProgressBarModule,
    MatListModule,
  ],
  exports: [
    ...components
  ]
})
export class SharedModule {
}

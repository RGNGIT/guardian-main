import {SerapisButton} from "@app/shared/components/serapis-button/serapis.button";
import {SharedTooltipDirective} from "@app/shared/direcives/shared-tooltip.directive";
import {SchemaFormComponent} from "@app/shared/components/schema-form-component/schema-form.component";
import {BaseDialogComponent} from "@app/shared/components/base-dialog/base-dialog.component";
import {NgModule} from "@angular/core";
import {AsyncProgressComponent} from "@app/shared/components/async-progress/async-progress.component";
import {DataGridComponent} from "@app/shared/components/data-grid/data-grid.component";
import {SharedTooltipComponent} from "@app/shared/components/shared-tooltip/shared-tooltip.component";
import {SerapisContainerComponent} from "@app/shared/components/serapis-container/serapis-container.component";
import {SerapisLinkComponent} from "@app/shared/components/serapis-link/serapis-link.component";
import {CommonModule, NgClass, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {NgxMatDatetimePickerModule, NgxMatTimepickerModule} from "@angular-material-components/datetime-picker";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatInputModule} from "@angular/material/input";
import {MatRadioModule} from "@angular/material/radio";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatListModule} from "@angular/material/list";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";


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
    NgxMatDatetimePickerModule,
    MatInputModule,
    NgxMatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressBarModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    ...components
  ]
})
export class SharedModule {
}

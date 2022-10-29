import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { MatCheckboxModule } from '@angular/material/checkbox';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SharedModule } from '@app/shared/shared.module';
import { SchemasPageComponent } from './schemes-page/schemas-page.component';
import { SchemasService } from '@app/services/schemas.service';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgForOf } from '@angular/common';
import { SchemaDialogComponent } from './schema-dialog/schema-dialog.component';
import { SchemaConfigurationComponent } from './schema-configuration/schema-configuration.component';
import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { MatRadioModule } from '@angular/material/radio';
import { SchemaFieldConfigurationComponent } from './schema-field-configuration/schema-field-configuration.component';
import { NgxFileDropModule } from 'ngx-file-drop';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { SetVersionDialogComponent } from './set-version-dialog/set-version-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VcDialogComponent } from './vc-dialog/vc-dialog.component';
import { ExportSchemaDialogComponent } from './export-schema-dialog/export-schema-dialog.component';
import { SchemaViewDialogComponent } from './schema-view-dialog/schema-view-dialog.component';
import { ImportSchemaDialogComponent } from './import-schema-dialog/import-schema-dialog.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DocumentViewComponent } from './document-view/document-view.component';
import { SchemaFormViewComponent } from './schema-form-view/schema-form-view.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SettingsService } from '@app/services/settings.service';
import {FileDragNDropComponent} from "@app/shared/components/file-grad-n-drop/file-drag-n-drop.component";

const routes: Routes = [
  {
    path: '',
    component: SchemasPageComponent
  }
];

const components = [
  SchemasPageComponent,
  SchemasPageComponent,
  SchemaFieldConfigurationComponent
];

@NgModule({
  declarations: [
    ...components,
    SchemaDialogComponent,
    SchemaConfigurationComponent,
    SchemaFieldConfigurationComponent,
    SetVersionDialogComponent,
    VcDialogComponent,
    ExportSchemaDialogComponent,
    SchemaViewDialogComponent,
    ImportSchemaDialogComponent,
    DocumentViewComponent,
    SchemaFormViewComponent
  ],
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
  ],
  providers: [SchemasService, SettingsService],
  exports: [...components],
  bootstrap: []
})
export class SchemasPageModule {}

import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { SharedModule } from '@app/shared/shared.module';

import { SchemasPageComponent } from './schemes-page/schemas-page.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import {SchemasService} from "@app/services/schemas.service";

const routes: Routes = [
  {
    path: '',
    component: SchemasPageComponent
  }
];

const components = [SchemasPageComponent];

@NgModule({
  declarations: [...components, SchemasPageComponent],
  imports: [RouterModule.forChild(routes), SharedModule, MatIconModule, MatCheckboxModule],
  providers: [SchemasService],
  exports: [...components],
  bootstrap: []
})
export class SchemasPageModule {}

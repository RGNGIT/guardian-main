import {NgModule} from "@angular/core";
import {TokensPageComponent} from "./tokens-page/tokens-page.component";
import {NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet} from "@angular/common";
import {SharedModule} from "@app/shared/shared.module";
import {MatIconModule} from "@angular/material/icon";
import {RouterModule, Routes} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSelectModule} from "@angular/material/select";
import {TokenDetailPageComponent} from "./token-detail/token-detail-page.component";

const routes: Routes = [
  {
    path: '',
    component: TokensPageComponent
  },
  {
    path: ':tokenId',
    component: TokenDetailPageComponent
  }
]

const components = [
  TokensPageComponent,
  TokenDetailPageComponent
]

@NgModule({
  imports: [
    NgIf,
    SharedModule,
    MatIconModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    NgForOf,
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
    NgSwitchDefault
  ],
  declarations: [
    ...components
  ]
})
export class TokensPageModule {}

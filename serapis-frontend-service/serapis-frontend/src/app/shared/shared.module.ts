import {NgModule} from "@angular/core";
import {SerapisButton} from "@app/shared/components/serapis-button/serapis.button";
import {SerapisLinkComponent} from "@app/shared/components/serapis-link/serapis-link.component";
import {NgClass} from "@angular/common";

const components = [
  SerapisButton,
  SerapisLinkComponent
]

@NgModule({
  declarations: [
    ...components
  ],
    imports: [
        NgClass
    ],
  exports: [
    ...components
  ]
})
export class SharedModule {
}

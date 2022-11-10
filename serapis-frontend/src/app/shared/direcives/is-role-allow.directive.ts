import {Directive, Input, TemplateRef, ViewContainerRef} from "@angular/core";
import {UserService} from "@app/services/user.service";

@Directive({
  selector: '[appIsRoleAllowDirective]',
})
export class IsRoleAllowDirective {

  constructor(
    private _view: ViewContainerRef,
    private _template: TemplateRef<any>,
    private _userService: UserService,
  ) {}

  @Input()
  set appIsRoleAllowDirective(parameters: { role: string, additionalConditions?: boolean[] }) {
    const additionalTerms = parameters?.additionalConditions ?? [true];
    if (this._userService.currentRole === parameters.role && additionalTerms.every( item => item)) {
      this._view.createEmbeddedView(this._template);
    } else {
      this._view.clear();
    }
  }

}

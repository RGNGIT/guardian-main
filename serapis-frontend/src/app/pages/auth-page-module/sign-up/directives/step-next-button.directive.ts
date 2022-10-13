import {ComponentRef, Directive, ElementRef, TemplateRef, ViewContainerRef} from "@angular/core";

@Directive({
  selector: '[appStepNextButton]'
})
export class StepNextButtonDirective {

  constructor(public _elRef: ElementRef) {
  }
}

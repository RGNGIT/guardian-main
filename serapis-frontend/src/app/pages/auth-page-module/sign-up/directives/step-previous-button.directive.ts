import {ComponentRef, Directive, ElementRef, TemplateRef, ViewContainerRef} from "@angular/core";

@Directive({
  selector: '[appStepPreviousButton]'
})
export class StepPreviousButtonDirective {

  constructor(public _elRef: ElementRef) {
  }
}

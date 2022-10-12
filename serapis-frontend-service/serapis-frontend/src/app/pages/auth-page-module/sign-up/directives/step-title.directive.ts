import {Directive, Input} from "@angular/core";

@Directive({
  selector: '[appStepTitle]'
})
export class StepTitleDirective {
  @Input() appStepTitle!: string;
}

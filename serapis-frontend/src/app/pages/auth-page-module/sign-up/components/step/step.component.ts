import {AfterViewInit, Component, ContentChild, EventEmitter, Input, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {StepTitleDirective} from "../../directives/step-title.directive";
import {Observable, of, Subject} from "rxjs";
import {StepState} from "../../model/step";

@Component({
  selector: 'app-sign-up-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss']
})
export class StepComponent implements AfterViewInit {
  private _canActivate!: boolean;
  private _complete!: boolean;
  @Input() form!: FormGroup;
  @Input() show = false;
  @Input() set canActivate(canActivate: boolean) {
    this._canActivate = canActivate;
    this.manualStateChange.emit();
  };
  get canActivate(): boolean {
    return this._canActivate;
  }
  @Input() set complete(complete: boolean) {
    this._complete = complete;
    this.manualStateChange.emit();
  };
  get complete(): boolean {
    return this._complete;
  }

  @Output() manualStateChange: EventEmitter<any> = new EventEmitter<any>();
  stepNumber!: number;
  state!: StepState;

  constructor(public titleDirective: StepTitleDirective) {

  }

  ngAfterViewInit(): void {
  }
}

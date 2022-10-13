import {AfterContentInit, Component, ContentChildren, OnDestroy, QueryList} from "@angular/core";
import {StepComponent} from "../step/step.component";
import {Step, StepState} from "../../model/step";
import {StepNextButtonDirective} from "../../directives/step-next-button.directive";
import {BehaviorSubject, fromEvent, of, Subscription, switchMap,} from "rxjs";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {StepPreviousButtonDirective} from "../../directives/step-previous-button.directive";

@UntilDestroy()
@Component({
  selector: 'app-sign-up-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements AfterContentInit, OnDestroy {
  @ContentChildren(StepComponent) stepsList!: QueryList<StepComponent>
  @ContentChildren(StepNextButtonDirective, {descendants: true}) nextButtons!: QueryList<StepNextButtonDirective>;
  @ContentChildren(StepPreviousButtonDirective, {descendants: true}) previousButtons!: QueryList<StepPreviousButtonDirective>;
  private stateChange: BehaviorSubject<any> = new BehaviorSubject<any>(0);
  private subscription: Subscription = new Subscription();
  stepState = StepState;
  steps!: Step[];
  activeStep = 0;

  ngAfterContentInit(): void {
    this.steps = this.stepsList.map( (item, id, array) => {
      if (id === 0) item.show = true;
      item.stepNumber = id;
      let state;
      if (id === 0) {
        state = this.stateChange
          .pipe(
            switchMap( _ => of(array[id].form.valid)),
            switchMap( (data) => data ? of(StepState.COMPLETE) : of(StepState.CURRENT))
          )
      } else {
        state = this.stateChange
          .pipe(
            switchMap( () => {
              let state = StepState.DISABLE;
              const activeStep = this.activeStep;

              if (array[id].form) {
                const previous = array[id - 1].form.valid;
                const current = array[id].form.valid;

                if (previous && array[id - 1].state !== StepState.DISABLE) {
                  state = StepState.ENABLE;
                }
                if (previous && current) {
                  state = StepState.COMPLETE;
                }
                if (id === activeStep && item.state !== StepState.DISABLE && !current) {
                  state = StepState.CURRENT;
                }

              } else {
                if (item.canActivate) {
                  state = StepState.ENABLE;
                }
                if (item.complete) {
                  state = StepState.COMPLETE;
                }
                if (id === activeStep && item.state !== StepState.DISABLE && item.canActivate && item.state !== StepState.COMPLETE) {
                  state = StepState.CURRENT;
                }
              }

              item.state = state;
              return of(state);
        }));
        array[id-1]?.form?.statusChanges?.subscribe( _ => { this.stateChange.next(this.stateChange.value)});
        array[id]?.form?.statusChanges?.subscribe( _ => this.stateChange.next(this.stateChange.value));
        item.manualStateChange.pipe(untilDestroyed(this)).subscribe( _ => {
          this.stateChange.next(this.activeStep);
        })
      }
      return {
        title: item.titleDirective.appStepTitle,
        state: state
      }
    });
    this.nextButtons.forEach( item => {
      this.subscription.add(fromEvent(item._elRef.nativeElement, 'click')
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.stepClickHandler(this.activeStep + 1 === this.stepsList.length ? this.activeStep : this.activeStep + 1);
        }));
    })
    this.previousButtons.forEach( item => {
      this.subscription.add(fromEvent(item._elRef.nativeElement, 'click')
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.stepClickHandler(this.activeStep - 1 < 0 ? this.activeStep : this.activeStep - 1);
        }));
    })

  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  stepClickHandler(i: number, force: boolean = false) {
    const current = this.stepsList.get(this.activeStep);
    const newCurrent = this.stepsList.get(i);
    if (!!current && !!newCurrent && (newCurrent.state !== StepState.DISABLE || force)) {
      current.show = false;
      newCurrent.show = true;
      this.activeStep = i;
      this.stateChange.next(this.activeStep);
    }
  }
}

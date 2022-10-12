import {BehaviorSubject, Observable} from "rxjs";

export enum StepState {
  CURRENT = 'CURRENT', DISABLE = 'DISABLE', ENABLE = 'ENABLE', COMPLETE = 'COMPLETE', ERROR = 'ERROR'
}

export interface Step {
  title: string;
  state: Observable<StepState>;
}

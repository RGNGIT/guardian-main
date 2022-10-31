import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  readonly loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  enable(): void {
    // todo fix it
    setTimeout(() => this.loading$?.next(true), 0)
  }

  disable(): void {
    // todo fix it
    setTimeout(() => this.loading$?.next(false), 0)
  }
}

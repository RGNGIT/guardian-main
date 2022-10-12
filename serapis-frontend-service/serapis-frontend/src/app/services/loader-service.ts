import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  readonly loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  enable(): void {
    this.loading$.next(true);
  }

  disable(): void {
    this.loading$.next(false);
  }
}

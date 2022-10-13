import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {MemoryStorage, storageAvailable} from "@app/models/memory-storage";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  public readonly storageAsObservable: BehaviorSubject<Storage | MemoryStorage>;
  private readonly storage: Storage | MemoryStorage;
  private ignoreKeys = [];

  constructor() {
    if (storageAvailable('localStorage')) {
      this.storage = window.localStorage;
    } else {
      this.storage = new MemoryStorage();
    }
    this.storageAsObservable = new BehaviorSubject<Storage | MemoryStorage>(this.storage);
  }

  public setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
    this.storageAsObservable.next(this.storage);
  }

  public clear(): void {
    const backupValues = new Map<string, string>;
    this.ignoreKeys.forEach(key => {
      const value = this.storage.getItem(key);
      if (!!value) {
        backupValues.set(key, value);
      }
    });
    this.storage.clear();
    this.ignoreKeys.forEach(key => {
      if (backupValues.has(key)) {
        this.storage.setItem(key, backupValues.get(key) || '');
      }
    });
    this.storageAsObservable.next(this.storage);
  }

  public getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  public removeItem(key: string): void {
    this.storage.removeItem(key);
    this.storageAsObservable.next(this.storage);
  }

}

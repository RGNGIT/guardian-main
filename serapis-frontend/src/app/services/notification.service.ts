import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationToastComponent } from '@app/shared/components/notification-toast/notification-toast.component';

export type NotificationSeverityType = 'warning' | 'error' | 'info' | 'success';

export interface INotificationData {
  message: string;
  severity: NotificationSeverityType;
  closeCallback: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private _snackBar: MatSnackBar) {}

  public show(
    message: string,
    severity: NotificationSeverityType,
    duration: number = 5000
  ): void {
    this._snackBar.openFromComponent(NotificationToastComponent, {
      duration,
      horizontalPosition: 'end',
      data: {
        message,
        severity,
        closeCallback: () => this._snackBar.dismiss()
      } as INotificationData
    });
  }
}

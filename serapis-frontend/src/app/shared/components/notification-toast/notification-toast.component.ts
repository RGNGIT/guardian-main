import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { INotificationData } from '@app/services/notification.service';

@Component({
  selector: 'app-notification-toast',
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationToastComponent implements OnInit {
  public data: INotificationData;

  constructor(@Inject(MAT_SNACK_BAR_DATA) data: INotificationData) {
    this.data = data;
  }

  ngOnInit(): void {}

  public close(): void {
    this.data.closeCallback();
  }
}

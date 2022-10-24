import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {WebSocketService} from 'src/app/services/web-socket.service';
import {delay, of, Subscription, timeout} from 'rxjs';
import {IStatus, StatusType} from "@app/models/async";

@Component({
  selector: 'async-progress',
  templateUrl: './async-progress.component.html',
  styleUrls: ['./async-progress.component.scss']
})
export class AsyncProgressComponent implements OnInit, OnDestroy {

  progressValue!: number;
  statusesCount: number = 3;
  statuses: IStatus[] =[];

  statusesRefMap: any = {};
  private _taskId!: string;
  @Input('taskId') set taskId(taskId: string) {
    this._taskId = taskId;
    this.statusesCount = 0;
    this.statuses.length = 0;
    this.progressValue = 0;
  }
  get taskId(): string {
    return this._taskId;
  }
  @Input('expected') expected!: number;

  @Output() completed = new EventEmitter<string>();
  @Output() error = new EventEmitter<any>();

  private subscription = new Subscription();

  constructor(private wsService: WebSocketService) { }

  ngOnInit() {
    this.subscription.add(
      this.wsService.taskSubscribe((event) => {
        const { taskId, statuses, completed, error } = event;
        if (taskId != this.taskId) { return; }

        if (completed) {
          this.progressValue = 100;
          if (error) {
            this.error.emit(error);
          } else {
            this.completed.emit(this.taskId);
          }
          return;
        }

        const newStatuses: IStatus[] = statuses || [];
        newStatuses.forEach((status) => {
          console.log(status)
          switch (status.type) {
            case StatusType.INFO:
              this.statuses.push(status);
              break;
            case StatusType.PROCESSING:
              this.statusesRefMap[status.message] = status;
              this.statuses.push(status);
              this.statusesCount++;
              break;
            case StatusType.COMPLETED:
              if (this.statusesRefMap[status.message]) {
                this.statusesRefMap[status.message].type = status.type;
                this.statusesCount++;
              } else {
                this.statusesRefMap[status.message] = status;
                this.statuses.push(status);
                this.statusesCount = this.statusesCount + 2;
              }
              break;
            default:
              console.log('Unknown status type');
              break;
          }
        });
        this.applyChanges();
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  isInfo(status: IStatus) {
    return status.type == StatusType.INFO;
  }

  private applyChanges() {
    if (!this.taskId) {
      return;
    }

    if (this.statusesCount > this.expected) {
      this.expected = this.statusesCount + 1;
    }
    this.progressValue = this.statusesCount * 90 / this.expected;
  }
}

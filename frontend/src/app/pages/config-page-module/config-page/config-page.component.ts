import {Component, OnInit, TemplateRef} from "@angular/core";
import {UserService} from "@app/services/user.service";
import {IUserProfile} from "@app/models/user";
import {BehaviorSubject, finalize, Observable} from "rxjs";
import {Dialog} from "@angular/cdk/dialog";
import {LoaderService} from "@app/services/loader-service";
import {WebSocketService} from "@app/services/web-socket.service";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: 'app-config-page',
  templateUrl: './config-page.component.html',
  styleUrls: ['./config-page.component.scss']
})
export class ConfigPageComponent implements OnInit {

  configInfo: BehaviorSubject<IUserProfile | null> = this._userService.currentProfile;
  balance!: string;
  balanceType!: string;

  constructor(
    private _userService: UserService,
    private _dialog: Dialog,
    private _loader: LoaderService,
    private _wsService: WebSocketService
  ) {

  }

  ngOnInit() {
    this._loader.enable();
    this._userService.getBalance().pipe(
      untilDestroyed(this),
      finalize(() => {
        this._loader.disable();
      })
    ).subscribe( data => {
      this.setBalanceData(data.message);
    })
    this._wsService.profileSubscribe((event) => {
      if (event.type === 'PROFILE_BALANCE') {
        console.log(event)
        this.setBalanceData(event);
      }
    }, () => {
      this.balance = 'N\\A';
      this.balanceType = '';
    });
  }

  private setBalanceData(data: any): void {
    if (data && data.balance) {
      const b = parseFloat(data.balance);
      this.balance = `${b.toFixed(3)} ${data.unit}`;
      if (b > 100) {
        this.balanceType = 'normal';
      } else if (b > 20) {
        this.balanceType = 'warn';
      } else {
        this.balanceType = 'error';
      }
    } else {
      this.balance = 'N\\A';
      this.balanceType = '';
    }
  }

  openDialog(template: TemplateRef<any>): void {
    this._dialog.open(template);
  }

  closeDialog(): void {
    this._dialog.closeAll();
  }

  getDid(): string {
    return JSON.stringify(this.configInfo?.value?.didDocument ) || '';
  }

  getVc() {
    return JSON.stringify(this.configInfo?.value?.vcDocument ) || '';
  }
}

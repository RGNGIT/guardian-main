import {Component, OnInit} from "@angular/core";
import {LoaderService} from "@app/services/loader-service";
import {SignService} from "../services/sign.service";
import {BehaviorSubject, delay, finalize, of} from "rxjs";
import {ConfirmUserResponse} from "../model/user";
import {ActivatedRoute} from "@angular/router";
import {UntilDestroy, untilDestroyed} from "@ngneat/until-destroy";
import {BaseResponse} from "@app/models/base-response";
import {URLS_PATHS} from "@app/constants/path";

@UntilDestroy()
@Component({
  selector: 'app-account-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  userInfo!: ConfirmUserResponse;
  errorInfo?: BaseResponse<any, any>;
  private params!: { u: string, c: string} | any;
  urlsRoutes = URLS_PATHS;

  constructor(private loadingService: LoaderService, private _apiService: SignService, private _route: ActivatedRoute) {
    this.loadingService.enable();
  }

  ngOnInit() {
    this.sendRequest();
  }

  sendRequest(): void {
    if (this.errorInfo) delete this.errorInfo;
    this._route.queryParams.subscribe(params => {
      this.params = params;
    });
    this._apiService.confirmUser(this.params).pipe(delay(2000), finalize( () => { this.loadingService.disable() } ), untilDestroyed(this)).subscribe( data => {
      if (data.code === 1) {
        this.userInfo = data;
      } else {
        this.errorInfo = data;
      }
    })
  }
}

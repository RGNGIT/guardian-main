import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './pages/dashboard-page/dashboard.component';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { GoalsComponent } from './pages/goals-page/goals.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {CUSTOM_ICONS} from "../assets/icons/custom-icons";
import {MatMenuModule} from "@angular/material/menu";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptor} from "@app/services/interceptor.service";
import { SharedModule } from '@app/shared/shared.module';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {NgxMatDatetimePickerModule, NgxMatTimepickerModule} from "@angular-material-components/datetime-picker";
import {MatInputModule} from "@angular/material/input";
import {AppConfigService} from "@app/services/app-config.service";
import {DEFAULT_DIALOG_CONFIG} from "@angular/cdk/dialog";
import {PageNotFoundComponent} from "./404page/page-not-found.component";
import {WebSocketService} from "@app/services/web-socket.service";

export function appInitServiceFactory(
  _sanitizer: DomSanitizer,
  _iconRegistry: MatIconRegistry,
  _service: AppConfigService,
  // _wsService: WebSocketService
): Function {
  for (const [key, value] of Object.entries(CUSTOM_ICONS)) {
    _iconRegistry.addSvgIconLiteral(
      key.toString(),
      _sanitizer.bypassSecurityTrustHtml(value.toString())
    );
  }
  return () => _service.load();
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    GoalsComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule,
    MatIconModule,
    MatMenuModule,
    HttpClientModule,
    SharedModule,
    MatDatepickerModule,
    MatInputModule,
    NgxMatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgxMatDatetimePickerModule,
    MatProgressBarModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitServiceFactory,
      deps: [
        DomSanitizer,
        MatIconRegistry,
        AppConfigService,
        // WebSocketService
      ],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: DEFAULT_DIALOG_CONFIG,
      useValue: {
        hasBackdrop: true,
        disableClose: false,
        minWidth: '300px',
        maxWidth: '80vw',
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

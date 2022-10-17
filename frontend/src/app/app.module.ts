import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule, DomSanitizer} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './pages/header/header.component';
import { HeaderNavbarComponent } from './pages/header/header-navbar/header-navbar.component';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import { GoalsComponent } from './pages/goals/goals.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {CUSTOM_ICONS} from "../assets/icons/custom-icons";
import {MatMenuModule} from "@angular/material/menu";

export function appInitServiceFactory(
  _sanitizer: DomSanitizer,
  _iconRegistry: MatIconRegistry
): Function {
  for (const [key, value] of Object.entries(CUSTOM_ICONS)) {
    _iconRegistry.addSvgIconLiteral(key.toString(), _sanitizer.bypassSecurityTrustHtml(value.toString()));
  }
  return () => {};
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HeaderNavbarComponent,
    DashboardComponent,
    GoalsComponent
  ],
  imports: [
      BrowserModule,
      AppRoutingModule,
      BrowserAnimationsModule,
      RouterModule,
      MatIconModule,
      MatProgressBarModule,
      MatMenuModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitServiceFactory,
      deps: [
        DomSanitizer,
        MatIconRegistry,
      ],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

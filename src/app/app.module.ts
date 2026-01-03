import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { routes } from './app-routing.module';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { UploadxModule } from 'node_modules/ngx-uploadx/public-api';
import * as Sentry from "@sentry/angular";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: "https://297945be24914a48b3bb87c331d2fa65@app.glitchtip.com/13128",
  tracesSampleRate: 0.9,
});

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NavbarComponent,
    BrowserAnimationsModule,
    MatMenuModule,
    UploadxModule
  ],
  providers: [
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({ showDialog: true }),
    },
    Sentry.TraceService,
  ],
  bootstrap: []
})
export class AppModule { }

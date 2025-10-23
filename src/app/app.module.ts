import { NgModule } from '@angular/core';
import { PublicTemplate } from './landing-modules/public-template/public-template';
import { ProtectedTemplate } from './landing-modules/protected-template/protected-template';
import { PublicTemplateModule } from './landing-modules/public-template/public-template-module';
import { ProtectedTemplateModule } from './landing-modules/protected-template/protected-template-module';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { AuthInterceptor, AuthModule } from 'angular-auth-oidc-client';
import { EntityDetails } from './components/entity-details/entity-details';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TokenManagerService } from './services/token-manager';
import { MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from './services/notification-service';
import { AppDialogData } from './pages/app-dialog-data/app-dialog-data';
@NgModule({
    imports: [
    FormsModule, BrowserModule, ReactiveFormsModule,MatDialogModule,FormsModule,
    PublicTemplateModule,ProtectedTemplateModule,  AuthModule.forRoot({
      config: {
        authority: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_ddXPh6PWc',
        redirectUrl: 'http://localhost:4200',
        clientId: '4amhtskq1d81v936gr5qu2102d',
        scope: 'email openid phone',
        responseType: 'code'
      },
    }),
  ],
  exports: [AuthModule,FormsModule, ReactiveFormsModule ,MatDialogModule],
  
 declarations: [
    EntityDetails,
    AppDialogData
  ], 
  providers: [ NotificationService,{
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },TokenManagerService]})
export class AppModule {}
import { NgModule } from '@angular/core';
import { PublicTemplate } from './landing-modules/public-template/public-template';
import { ProtectedTemplate } from './landing-modules/protected-template/protected-template';
import { PublicTemplateModule } from './landing-modules/public-template/public-template-module';
import { ProtectedTemplateModule } from './landing-modules/protected-template/protected-template-module';
import { provideHttpClient } from '@angular/common/http';
import { AuthModule } from 'angular-auth-oidc-client';
@NgModule({
    imports: [
    
    PublicTemplateModule,ProtectedTemplateModule,  AuthModule.forRoot({
      config: {
        authority: 'https://cognito-idp.eu-north-1.amazonaws.com/eu-north-1_M6dp7rfAC',
        redirectUrl: 'http://localhost:4200',
        clientId: '1e3316k9pmltncrvkgps2is19m',
        scope: 'email openid phone',
        responseType: 'code'
      },
    }),
  ],
  exports: [AuthModule],
  
 declarations: [], 
  providers: [ provideHttpClient()]})
export class AppModule {}
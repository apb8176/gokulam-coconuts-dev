import { NgModule } from '@angular/core';
import { PublicTemplate } from './landing-modules/public-template/public-template';
import { ProtectedTemplate } from './landing-modules/protected-template/protected-template';
import { PublicTemplateModule } from './landing-modules/public-template/public-template-module';
import { ProtectedTemplateModule } from './landing-modules/protected-template/protected-template-module';
@NgModule({imports: [
    
    PublicTemplateModule,ProtectedTemplateModule
], declarations: [

], providers: []})
export class AppModule {}
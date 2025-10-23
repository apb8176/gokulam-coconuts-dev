import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicTemplateRoutingModule } from './public-template-routing-module';
import { HomeComponent } from './home/home.component';
import { SignupPopupComponent } from './signup-popup-component/signup-popup-component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmCodePopup } from './confirm-code-popup/confirm-code-popup';
import { SigninPopup } from './signin-popup/signin-popup';
import { PublicTemplate } from './public-template';


@NgModule({
  declarations: [
    PublicTemplate,
    HomeComponent,SignupPopupComponent, ConfirmCodePopup, SigninPopup
  ],
  imports: [
    CommonModule,FormsModule,  ReactiveFormsModule,
    PublicTemplateRoutingModule
  ]
})
export class PublicTemplateModule { }

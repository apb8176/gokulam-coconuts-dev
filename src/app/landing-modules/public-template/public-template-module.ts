import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicTemplateRoutingModule } from './public-template-routing-module';
import { PublicTemplate } from './public-template';
import { HomeComponent } from './home/home.component';
import { SignupPopupComponent } from './signup-popup-component/signup-popup-component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PublicTemplate,
    HomeComponent,SignupPopupComponent
  ],
  imports: [
    CommonModule,FormsModule,  ReactiveFormsModule,
    PublicTemplateRoutingModule
  ]
})
export class PublicTemplateModule { }

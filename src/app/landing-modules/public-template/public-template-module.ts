import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicTemplateRoutingModule } from './public-template-routing-module';
import { PublicTemplate } from './public-template';
import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [
    PublicTemplate,
    HomeComponent
  ],
  imports: [
    CommonModule,
    PublicTemplateRoutingModule
  ]
})
export class PublicTemplateModule { }

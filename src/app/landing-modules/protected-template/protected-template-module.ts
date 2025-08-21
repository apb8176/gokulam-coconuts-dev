import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProtectedTemplateRoutingModule } from './protected-template-routing-module';
import { ProtectedTemplate } from './protected-template';
import { BussinessOwnerModule } from './modules/bussiness-owner/bussiness-owner-module';


@NgModule({
  declarations: [
    ProtectedTemplate
  ],
  imports: [
    CommonModule,BussinessOwnerModule,
    ProtectedTemplateRoutingModule
  ]
})
export class ProtectedTemplateModule { }

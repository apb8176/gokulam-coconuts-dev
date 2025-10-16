import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProtectedTemplateRoutingModule } from './protected-template-routing-module';
import { ProtectedTemplate } from './protected-template';
import { BussinessOwnerModule } from './modules/bussiness-owner/bussiness-owner-module';
import { CommunityMemberModule } from './modules/community-member/community-member-module';
import { AdminModule } from './modules/admin/admin-module';
import { PropertyOwnerModule } from './modules/property-owner/property-owner-module';


@NgModule({
  declarations: [
    ProtectedTemplate
  ],
  imports: [
    CommonModule,BussinessOwnerModule,AdminModule,PropertyOwnerModule,
    ProtectedTemplateRoutingModule,CommunityMemberModule
  ]
})
export class ProtectedTemplateModule { }

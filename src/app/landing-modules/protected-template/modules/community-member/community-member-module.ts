import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommunityMemberRoutingModule } from './community-member-routing-module';
import { CustomerDashboard } from './customer-dashboard/customer-dashboard';


@NgModule({
  declarations: [
    
    CustomerDashboard
  ],
  imports: [
    CommonModule,
    CommunityMemberRoutingModule
  ]
})
export class CommunityMemberModule { }

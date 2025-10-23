import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommunityMemberRoutingModule } from './community-member-routing-module';
import { CustomerDashboard } from './components/customer-dashboard/customer-dashboard';
import { ItemList } from './components/item-list/item-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MemeberProfile } from './components/member-profile/member-profile';


@NgModule({
  declarations: [
    MemeberProfile,
    CustomerDashboard,
          ItemList
  ],
  imports: [
    CommonModule,FormsModule,ReactiveFormsModule,
    CommunityMemberRoutingModule
  ]
})
export class CommunityMemberModule { }

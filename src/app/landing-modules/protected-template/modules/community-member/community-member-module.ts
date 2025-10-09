import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommunityMemberRoutingModule } from './community-member-routing-module';
import { CustomerDashboard } from './customer-dashboard/customer-dashboard';
import { ItemList } from './item-list/item-list';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    
    CustomerDashboard,
          ItemList
  ],
  imports: [
    CommonModule,FormsModule,
    CommunityMemberRoutingModule
  ]
})
export class CommunityMemberModule { }

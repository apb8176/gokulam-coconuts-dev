import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BussinessOwnerRoutingModule } from './bussiness-owner-routing-module';
import { BoProfile } from './components/bo-profile/bo-profile';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoBusinessDetails } from './components/bo-business-details/bo-business-details';
import { BoEventList } from './components/bo-event-list/bo-event-list';
import { BoDashboard } from './components/bo-dashboard/bo-dashboard';


@NgModule({
  declarations: [
    BoDashboard,
    BoProfile,
    BoBusinessDetails,
    BoEventList
  ],
  imports: [
    CommonModule,FormsModule,ReactiveFormsModule,
    BussinessOwnerRoutingModule
  ]
})
export class BussinessOwnerModule { }

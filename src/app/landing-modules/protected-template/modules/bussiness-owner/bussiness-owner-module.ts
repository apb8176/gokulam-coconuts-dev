import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BussinessOwnerRoutingModule } from './bussiness-owner-routing-module';
import { BoDashboard } from './components/bo-dashboard/bo-dashboard';
import { BoProfile } from './components/bo-profile/bo-profile';
import { BoPostList } from './components/bo-post-list/bo-post-list';
import { BoPostDetails } from './components/bo-post-details/bo-post-details';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    BoDashboard,
    BoProfile,
    BoPostList,
    BoPostDetails
  ],
  imports: [
    CommonModule,FormsModule,ReactiveFormsModule,
    BussinessOwnerRoutingModule
  ]
})
export class BussinessOwnerModule { }

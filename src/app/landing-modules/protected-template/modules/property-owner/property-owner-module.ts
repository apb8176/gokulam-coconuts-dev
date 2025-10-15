import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PropertyOwnerRoutingModule } from './property-owner-routing-module';
import { PropertyOwnerPostDetails } from './components/property-owner-post-details/property-owner-post-details';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PropertyOwnerDashboard } from './components/property-owner-dashboard/property-owner-dashboard';
import { PropertyOwnerProfile } from './components/property-owner-profile/property-owner-profile';
import { PropertyOwnerPostList } from './components/property-owner-post-list/property-owner-post-list';


@NgModule({
  declarations: [
    PropertyOwnerPostDetails,
    PropertyOwnerDashboard,
    PropertyOwnerProfile,
    PropertyOwnerPostList
  ],
  imports: [
    CommonModule,FormsModule,ReactiveFormsModule,
    PropertyOwnerRoutingModule
  ]
})
export class PropertyOwnerModule { }

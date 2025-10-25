import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { AllRequestsComponent } from './components/all-requests-component/all-requests-component';
import { FormsModule } from '@angular/forms';
import { AllUserData } from './components/all-user-data/all-user-data';


@NgModule({
  declarations: [
    AdminDashboard,
    AllRequestsComponent,
    AllUserData
  ],
  imports: [
    CommonModule,FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }

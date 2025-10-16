import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { AllRequestsComponent } from './components/all-requests-component/all-requests-component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdminDashboard,
    AllRequestsComponent
  ],
  imports: [
    CommonModule,FormsModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }

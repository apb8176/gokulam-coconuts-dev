import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing-module';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { AllRequestsComponent } from './components/all-requests-component/all-requests-component';
import { FormsModule } from '@angular/forms';
import { AllUserData } from './components/all-user-data/all-user-data';
import { InterestListComponent } from './components/interest-list.component/interest-list.component';
import { LoaderComponent } from '../../common-components/loader.component/loader.component';


@NgModule({
  declarations: [
    AdminDashboard,
    AllRequestsComponent,
    AllUserData,
    InterestListComponent
  ],
  imports: [
    CommonModule,FormsModule,
    AdminRoutingModule,LoaderComponent
  ],
  exports:[InterestListComponent]
})
export class AdminModule { }

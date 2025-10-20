import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { YogaStudioRoutingModule } from './yoga-studio-routing-module';
import { YsDashboard } from './components/ys-dashboard/ys-dashboard';
import { YsProfile } from './components/ys-profile/ys-profile';
import { YsDetails } from './components/ys-details/ys-details';
import { YsEventList } from './components/ys-event-list/ys-event-list';
import { YsEventDetails } from './components/ys-event-details/ys-event-details';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    YsDashboard,
    YsProfile,
    YsDetails,
    YsEventList,
    YsEventDetails
  ],
  imports: [
    CommonModule,FormsModule,ReactiveFormsModule,
    YogaStudioRoutingModule
  ]
})
export class YogaStudioModule { }

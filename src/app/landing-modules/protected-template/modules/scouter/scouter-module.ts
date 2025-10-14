import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScouterRoutingModule } from './scouter-routing-module';
import { ScouterDashboard } from './components/scouter-dashboard/scouter-dashboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ScouterDashboard
  ],
  imports: [
    CommonModule,FormsModule,ReactiveFormsModule,
    ScouterRoutingModule
  ]
})
export class ScouterModule { }

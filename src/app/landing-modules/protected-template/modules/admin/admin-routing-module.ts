import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { AllRequestsComponent } from './components/all-requests-component/all-requests-component';

const routes: Routes = [
  {
    path:'',pathMatch:'full',redirectTo:'dashboard'
  },
  {
    path:'dashboard',component:AdminDashboard
  },
  {
    path:'requests',component:AllRequestsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

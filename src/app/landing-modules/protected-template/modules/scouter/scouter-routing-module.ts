import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScouterDashboard } from './components/scouter-dashboard/scouter-dashboard';

const routes: Routes = [
  {
    path:'',pathMatch:'full',redirectTo:'dashboard'
  },
  {
    path:'dashboard',component:ScouterDashboard
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScouterRoutingModule { }

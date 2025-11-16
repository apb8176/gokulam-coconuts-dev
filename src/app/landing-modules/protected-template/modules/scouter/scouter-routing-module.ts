import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScouterDashboard } from './components/scouter-dashboard/scouter-dashboard';
import { NotificationsComponent } from '../../common-components/notifications.component/notifications.component';

const routes: Routes = [
  {
    path:'',pathMatch:'full',redirectTo:'dashboard'
  },
  {
    path:'dashboard',component:ScouterDashboard
  },
    {
      path:'notifications',component:NotificationsComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScouterRoutingModule { }

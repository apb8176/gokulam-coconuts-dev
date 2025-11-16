import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoDashboard } from './components/bo-dashboard/bo-dashboard';
import { BoProfile } from './components/bo-profile/bo-profile';
import { BoBusinessDetails } from './components/bo-business-details/bo-business-details';
import { BoEventList } from './components/bo-event-list/bo-event-list';
import { NotificationsComponent } from '../../common-components/notifications.component/notifications.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: BoDashboard,
  },
  {
    path: 'profile',
    component: BoProfile, // Assuming BoPostList handles details as well
  },
  {
    path: 'business-details',
    component: BoBusinessDetails, // Assuming BoPostList handles details as well
  },
  {
    path:'events',
    component:BoEventList
  },
    {
      path:'notifications',component:NotificationsComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BussinessOwnerRoutingModule {}

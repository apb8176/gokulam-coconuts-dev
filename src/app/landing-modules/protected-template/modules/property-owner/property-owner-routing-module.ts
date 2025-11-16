import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyOwnerDashboard } from './components/property-owner-dashboard/property-owner-dashboard';
import { PropertyOwnerPostDetails } from './components/property-owner-post-details/property-owner-post-details';
import { PropertyOwnerPostList } from './components/property-owner-post-list/property-owner-post-list';
import { PropertyOwnerProfile } from './components/property-owner-profile/property-owner-profile';
import { NotificationsComponent } from '../../common-components/notifications.component/notifications.component';

const routes: Routes = [
  {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
      
    },
    {
      path: 'dashboard',
     component: PropertyOwnerDashboard,    
    },
    {
      path:'listing',
      component: PropertyOwnerPostList,
    },
    {
      path:'details',
      component: PropertyOwnerPostDetails, // Assuming BoPostList handles details as well
    },
      {
      path:'profile',
      component: PropertyOwnerProfile, // Assuming BoPostList handles details as well
    },
      {
        path:'notifications',component:NotificationsComponent
      }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropertyOwnerRoutingModule { }

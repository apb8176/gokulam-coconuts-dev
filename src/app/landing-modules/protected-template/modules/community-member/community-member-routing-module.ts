import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerDashboard } from './components/customer-dashboard/customer-dashboard';
import { ItemList } from './components/item-list/item-list';
import { ClassifiedsComponent } from './components/classifieds-component/classifieds-component';
import { PropertyOwnerProfile } from '../property-owner/components/property-owner-profile/property-owner-profile';

const routes: Routes = [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
      
    },
    {
      path: 'dashboard',
     component: CustomerDashboard,    
    },
    {
      path: 'section',
     component: ItemList,    
    },
    {
      path: 'classifieds',
      component: ClassifiedsComponent
    },
    {
      path: 'profile',
      component: PropertyOwnerProfile
    }
  ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityMemberRoutingModule { }

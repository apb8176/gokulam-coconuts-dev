import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerDashboard } from './customer-dashboard/customer-dashboard';
import { ItemList } from './item-list/item-list';

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
    }
  ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommunityMemberRoutingModule { }

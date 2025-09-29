import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoDashboard } from './components/bo-dashboard/bo-dashboard';
import { BoPostList } from './components/bo-post-list/bo-post-list';
import { BoPostDetails } from './components/bo-post-details/bo-post-details';

const routes: Routes = [
  {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
      
    },
    {
      path: 'dashboard',
     component: BoDashboard,    
    },
    {
      path:'listing',
      component: BoPostList,
    },
    {
      path:'details',
      component: BoPostDetails, // Assuming BoPostList handles details as well
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BussinessOwnerRoutingModule { }

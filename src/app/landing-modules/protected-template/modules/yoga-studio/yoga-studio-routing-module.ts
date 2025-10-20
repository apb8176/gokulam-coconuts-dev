import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { YsDashboard } from './components/ys-dashboard/ys-dashboard';
import { YsProfile } from './components/ys-profile/ys-profile';
import { YsDetails } from './components/ys-details/ys-details';
import { YsEventList } from './components/ys-event-list/ys-event-list';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: YsDashboard,
  },
  {
    path: 'profile',
    component: YsProfile, // Assuming BoPostList handles details as well
  },
  {
    path: 'yoga-studio-details',
    component: YsDetails, // Assuming BoPostList handles details as well
  },
  {
    path:'events',
    component:YsEventList
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class YogaStudioRoutingModule { }

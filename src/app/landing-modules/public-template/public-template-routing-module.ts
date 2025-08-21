import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicTemplate } from './public-template';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: PublicTemplate,
    children: [
       { path: '', redirectTo:'home', pathMatch: 'full' },

       { path: 'home', component:HomeComponent }]
      },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicTemplateRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicTemplate } from './public-template';
import { HomeComponent } from './home/home.component';
import { GalleryComponent } from './gallery-component/gallery-component';

const routes: Routes = [
  {
    path: '',
    component: PublicTemplate,
    children: [
       { path: '', redirectTo:'home', pathMatch: 'full' },

       { path: 'home', component:HomeComponent },
         { path: 'gallery', component:GalleryComponent },
      ]
      },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicTemplateRoutingModule { }

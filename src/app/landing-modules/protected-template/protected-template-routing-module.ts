import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedTemplate } from './protected-template';

const routes: Routes = [
  {
    path: '',
    component: ProtectedTemplate,
    children: [
      {path: '', redirectTo: 'property-owner', pathMatch: 'full' },
      {
        path: 'property-owner',
        loadChildren: () =>
          import('../protected-template/modules/bussiness-owner/bussiness-owner-module').then(
            (m) => m.BussinessOwnerModule
          ),
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProtectedTemplateRoutingModule {}

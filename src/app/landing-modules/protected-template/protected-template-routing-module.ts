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
          import('../protected-template/modules/property-owner/property-owner-module').then(
            (m) => m.PropertyOwnerModule
          ),
      },
      {
        path: 'busines-owner',
        loadChildren: () =>
          import('../protected-template/modules/bussiness-owner/bussiness-owner-module').then(
            (m) => m.BussinessOwnerModule
          ),
      },
      {
        path: 'community-member',
        loadChildren: () =>
          import('../protected-template/modules/community-member/community-member-module').then(
            (m) => m.CommunityMemberModule
          ),
      },
      {
        path: 'scout',
        loadChildren: () =>
          import('../protected-template/modules/scouter/scouter-module').then(
            (m) => m.ScouterModule
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

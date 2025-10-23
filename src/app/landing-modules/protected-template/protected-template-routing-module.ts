// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { ProtectedTemplate } from './protected-template';

// const routes: Routes = [
//   {
//     path: '',
//     component: ProtectedTemplate,
//     children: [
//       {path: '', redirectTo: 'property-owner', pathMatch: 'full' },
//       {
//         path: 'property-owner',
//         loadChildren: () =>
//           import('../protected-template/modules/property-owner/property-owner-module').then(
//             (m) => m.PropertyOwnerModule
//           ),
//       },
//       {
//         path: 'busines-owner',
//         loadChildren: () =>
//           import('../protected-template/modules/bussiness-owner/bussiness-owner-module').then(
//             (m) => m.BussinessOwnerModule
//           ),
//       },
//       {
//         path: 'community-member',
//         loadChildren: () =>
//           import('../protected-template/modules/community-member/community-member-module').then(
//             (m) => m.CommunityMemberModule
//           ),
//       },
//       {
//         path: 'yoga-studio',
//         loadChildren: () =>
//           import('../protected-template/modules/yoga-studio/yoga-studio-module').then(
//             (m) => m.YogaStudioModule
//           ),
//       },
//       {
//         path: 'scout',
//         loadChildren: () =>
//           import('../protected-template/modules/scouter/scouter-module').then(
//             (m) => m.ScouterModule
//           ),
//       },
//       {
//         path: 'admin',
//         loadChildren: () =>
//           import('../protected-template/modules/admin/admin-module').then(
//             (m) => m.AdminModule
//           ),
//       }
//     ],
//   },
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule],
// })
// export class ProtectedTemplateRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProtectedTemplate } from './protected-template';
import { RoleGuard } from '../../core/guards/role.guard'; // update path as needed

const routes: Routes = [
  {
    path: '',
    component: ProtectedTemplate,
    canActivateChild: [RoleGuard],
    children: [
      { path: '', redirectTo: 'property-owner', pathMatch: 'full' },
      {
        path: 'property-owner',
        loadChildren: () =>
          import('../protected-template/modules/property-owner/property-owner-module').then(
            (m) => m.PropertyOwnerModule
          ),
        data: { allowedRoles: ['property-owner'] }
      },
      {
        path: 'busines-owner',
        loadChildren: () =>
          import('../protected-template/modules/bussiness-owner/bussiness-owner-module').then(
            (m) => m.BussinessOwnerModule
          ),
        data: { allowedRoles: ['busines-owner'] }
      },
      {
        path: 'community-member',
        loadChildren: () =>
          import('../protected-template/modules/community-member/community-member-module').then(
            (m) => m.CommunityMemberModule
          ),
        data: { allowedRoles: ['community-member'] }
      },
      {
        path: 'yoga-studio',
        loadChildren: () =>
          import('../protected-template/modules/yoga-studio/yoga-studio-module').then(
            (m) => m.YogaStudioModule
          ),
        data: { allowedRoles: ['yoga-studio'] }
      },
      {
        path: 'scout',
        loadChildren: () =>
          import('../protected-template/modules/scouter/scouter-module').then(
            (m) => m.ScouterModule
          ),
        data: { allowedRoles: ['scout'] }
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('../protected-template/modules/admin/admin-module').then(
            (m) => m.AdminModule
          ),
        data: { allowedRoles: ['admin'] }
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProtectedTemplateRoutingModule {}

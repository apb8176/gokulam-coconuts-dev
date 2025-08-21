// app.routes.ts
import { Routes } from '@angular/router';
import { AdminAuthGuard } from './core/guards/admin-auth.guard';
import { AuthGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  {
    path: '', 
    // loadChildren: () =>
    //   import('./modules/ngo/ngo.module').then(m => m.NgoModule),
    loadChildren: () =>
      import('./landing-modules/public-template/public-template-module').then((m) => m.PublicTemplateModule),
  },
   {
    path: 'landing',
    // loadChildren: () =>
    //   import('./modules/ngo/ngo.module').then(m => m.NgoModule),
    loadChildren: () =>
      import('./landing-modules/protected-template/protected-template-module').then((m) => m.ProtectedTemplateModule),
  },
  {
    path: 'listings/:id',
    loadComponent: () =>
      import('./features/listings/listings.component').then(
        (m) => m.ListingDetailComponent
      ),
  },
  {
    path: 'my-coupons',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/members/members.component').then(
        (m) => m.MyCouponsComponent
      ),
  },
  {
    path: 'property-owner/dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/property-owner/property-owner.component').then(
        (m) => m.PropertyOwnerDashboardComponent
      ),
  },
  {
    path: 'business-owner/dashboard',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/business-owner/business-owner.component').then(
        (m) => m.BusinessOwnerDashboardComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [AdminAuthGuard],
    loadComponent: () =>
      import('./features/admin/admin.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

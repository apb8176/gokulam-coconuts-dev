
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./landing-modules/public-template/public-template-module').then((m) => m.PublicTemplateModule),
  },
  {
    path: 'landing',
    loadChildren: () =>
      import('./landing-modules/protected-template/protected-template-module').then((m) => m.ProtectedTemplateModule),
    canActivate: [AuthGuard] // require signed-in + approved to access protected template at all
  },
  // optional: catch-all
  { path: '**', redirectTo: '' }
];

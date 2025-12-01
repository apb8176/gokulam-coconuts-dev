// public-template.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-template',
  templateUrl: './public-template.html',
  // keep styles in a separate scss file if you want; Tailwind handles most styling
  styleUrls: ['./public-template.scss'],
  standalone: false,
})
export class PublicTemplate implements OnInit {
  mobileMenuOpen = false;
  showSignupPopup = false;
  showLoginForm = false;
  showConfirmUserForm = false;

  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly router = inject(Router);

  configuration$ = this.oidcSecurityService.getConfiguration();
  userData$ = this.oidcSecurityService.userData$;
  constructor( private auth: AuthService,private cdr:ChangeDetectorRef){}
  isAuthenticated = false;
showBillingPopup: boolean = false;
  userData: any;

  ngOnInit(): void {
     let  user:any = this.auth.getUser();
   
    // Not signed in -> go to public template (root)
  
    
    // If pending approval -> remain on home (public root) and show waiting popup
    
    if (user &&  user.approval && user.approval === 'pending') {
      if(user.user_type === 'business-owner'||user.user_type === 'property-owner'||user.user_type === 'yoga-studio'){
        this.showBillingPopup = true;
      }
     
    }
    // keep template mobile menu state tidy on route change
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.mobileMenuOpen = false;
    });

    // subscribe auth state
    this.oidcSecurityService.isAuthenticated$.subscribe(
      ({ isAuthenticated }: { isAuthenticated: boolean }) => {
        this.isAuthenticated = isAuthenticated;
        // console.debug('authenticated: ', isAuthenticated);
      }
    );
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  // Trigger OIDC authorize flow
  login(): void {
    this.oidcSecurityService.authorize();
  }

  // callback used by signup popup
  returnSignupData(event: any) {
    this.userData = event.input;
    console.log('Signup returned to parent:', event);
    this.showSignupPopup = false;
    this.showConfirmUserForm = true;
  }

  returnConfirmData(event: any) {
    console.log('Confirm returned to parent:', event);
    this.showConfirmUserForm = false;
    this.showLoginForm = true;
    // if(this.userData.role === 'business-owner'||this.userData.role === 'property-owner'||this.userData.role === 'yoga-studio'){
    //   this.showBillingPopup = true;
    // }
    this.cdr.detectChanges(); 
  }

  // toggles signup popup when called from header button
  handleSignup(event: any) {
    // If event is emitted from a child popup keep logic; if called from header button it will be undefined
    this.showSignupPopup = !this.showSignupPopup;
    console.log('handleSignup called, payload:', event);
  }

  // toggles login popup
  handleLogin() {
    this.showLoginForm = !this.showLoginForm;
  }

  // logout: clear client storage and redirect to homepage (adjust as needed)
  logout(): void {
    if (window.sessionStorage) {
      window.sessionStorage.clear();
      window.localStorage.clear();
    }
    // If you have a federated logout URL use that. For now redirect to home:
    window.location.href = '/';
  }
}

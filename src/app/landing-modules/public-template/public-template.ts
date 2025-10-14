import { Component, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-public-template',
  standalone:false,
  templateUrl: './public-template.html',
  styleUrl: './public-template.scss'
  
})
export class PublicTemplate {
showConfirmUserForm:boolean = false;
returnSignupData(event: any) {
    console.log('---->',event);
    this.showSignupPopup = false; 
    this.showConfirmUserForm = true;

}
returnConfirmData(event: any) {
    console.log('---->',event);
  
    this.showConfirmUserForm = false; 

}
showMobileMenu: boolean = false;
  private readonly oidcSecurityService = inject(OidcSecurityService);

  configuration$ = this.oidcSecurityService.getConfiguration();

  userData$ = this.oidcSecurityService.userData$;

  isAuthenticated = false;
  showLoginForm: boolean = false;

  ngOnInit(): void {
    this.oidcSecurityService.isAuthenticated$.subscribe(
      ({ isAuthenticated }: { isAuthenticated: boolean }) => {
        this.isAuthenticated = isAuthenticated;

        console.warn('authenticated: ', isAuthenticated);
      }
    );
  }
   login(): void {
    this.oidcSecurityService.authorize();
  }
    showSignupPopup: boolean = false;

  handleSignup(event:any): void {
    this.showSignupPopup = !this.showSignupPopup;
   let formData = {}
   console.log('Signup data received in parent:', event);
    
  }
  handleLogin(){
    this.showLoginForm = !this.showLoginForm;
  }
  logout(): void {
  // Clear session storage
  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }

  // window.location.href = "https://eu-north-1m6dp7rfac.auth.eu-north-1.amazoncognito.com/logout?client_id=1e3316k9pmltncrvkgps2is19m&logout_uri=http://localhost:4200";
  window.location.href = "http://localhost:4200";

}
}

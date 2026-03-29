import { Component } from '@angular/core';
import { SignupPopupService } from '../signup-popup.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
   title = 'Gokulam Coconut';
 
  constructor(private readonly signupPopupService: SignupPopupService) {}

  openSignupForm(event?: Event, role?: string): void {
    event?.preventDefault();
    this.signupPopupService.show(role);
  }

}

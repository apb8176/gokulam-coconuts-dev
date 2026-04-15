import { Component } from '@angular/core';
import { SignupPopupService } from '../signup-popup.service';

@Component({
  selector: 'app-services',
  standalone: false,
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent {
  constructor(private readonly signupPopupService: SignupPopupService) {}

  openSignupForm(event?: Event, role?: string): void {
    event?.preventDefault();
    this.signupPopupService.show(role);
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private role: string = '';

  constructor() {}

  login(role: string) {
    this.loggedIn = true;
    this.role = role;
  }

  logout() {
    this.loggedIn = false;
    this.role = '';
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getUserRole(): string {
    return this.role;
  }
}

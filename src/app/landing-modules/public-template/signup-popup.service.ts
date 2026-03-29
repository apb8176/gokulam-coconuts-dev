import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupPopupService {
  private readonly visibility = new BehaviorSubject<boolean>(false);
  private readonly roleSelection = new BehaviorSubject<string | null>(null);

  readonly isVisible$: Observable<boolean> = this.visibility.asObservable();
  readonly selectedRole$: Observable<string | null> = this.roleSelection.asObservable();

  show(role?: string): void {
    this.roleSelection.next(role ?? null);
    this.visibility.next(true);
  }

  hide(): void {
    this.visibility.next(false);
    this.roleSelection.next(null);
  }

  toggle(role?: string): void {
    const nextVisible = !this.visibility.value;
    if (nextVisible) {
      this.roleSelection.next(role ?? null);
    } else {
      this.roleSelection.next(null);
    }
    this.visibility.next(nextVisible);
  }

  get isVisible(): boolean {
    return this.visibility.value;
  }
}

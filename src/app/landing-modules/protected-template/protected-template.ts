import { Component } from '@angular/core';
import { navRoutes } from './models/nav-routs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-protected-template',
  standalone: false,
  templateUrl: './protected-template.html',
  styleUrl: './protected-template.scss',
})
export class ProtectedTemplate {
  showMobileMenu: boolean = false;
  navItems: any = navRoutes;
  selectedNavItem: any = [];
  constructor(private router : Router) {}
  ngOnInit() {
    this.selectedNavItem = this.navItems.find((item: any) => this.router.url.includes(item.user_type))['navItems'];
    console.log('selectedNavItem', this.selectedNavItem);
    
  }
}

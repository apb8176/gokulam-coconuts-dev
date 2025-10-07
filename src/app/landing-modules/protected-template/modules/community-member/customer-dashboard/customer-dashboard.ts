// File: customer-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface DashboardItem {
  id: string;
  title: string;
  description: string;
  category: 'real-estate' | 'business' | 'yoga' | 'other' | 'post';
  image?: string;
  postedAt: string; // ISO
  location?: string;
  status?: 'new' | 'viewed' | 'responded' | 'in-progress' | 'closed';
}

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.html',
  styleUrls: ['./customer-dashboard.scss'],
  standalone: false
})
export class CustomerDashboard implements OnInit {
  // Summaries by section (display top N and Show more button)
  latestPosts: DashboardItem[] = [];
  realEstates: DashboardItem[] = [];
  businesses: DashboardItem[] = [];
  yogaStudios: DashboardItem[] = [];
  others: DashboardItem[] = [];

  // UI config
  displayLimit = 4; // top items to show in card grid

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In real app, replace these with HTTP calls to backend service
    const now = new Date();
    const iso = (d: Date) => d.toISOString();

    this.latestPosts = [
      {
        id: 'p1', title: 'Community Meet - Park Cleanup', description: 'Join local volunteers for a morning cleanup at the central park.',
        category: 'post', postedAt: iso(now), image: 'https://placeimg.com/640/360/nature', status: 'new'
      },
      {
        id: 'p2', title: 'Job: Front Desk Executive', description: 'Local hotel looking for a friendly front desk executive (walk-in).',
        category: 'other', postedAt: iso(new Date(now.getTime()-1000*60*60*24)), image: 'https://placeimg.com/640/360/people', status: 'viewed'
      },
    ];

    this.realEstates = [
      { id: 'r1', title: '3BHK Apartment for Rent', description: 'Spacious 3BHK with balcony, near metro.', category: 'real-estate', postedAt: iso(new Date(now.getTime()-1000*60*60*48)), image: 'https://placeimg.com/640/360/arch', location: 'Mysore', status: 'responded' },
      { id: 'r2', title: 'Plot for Sale - 2400 sqft', description: 'Residential plot in gated community.', category: 'real-estate', postedAt: iso(new Date(now.getTime()-1000*60*60*72)), image: 'https://placeimg.com/640/360/land', location: 'Mysore', status: 'new' },
    ];

    this.businesses = [
      { id: 'b1', title: 'Sunnys Bakery - New', description: 'Freshly baked goods, now open.', category: 'business', postedAt: iso(new Date(now.getTime()-1000*60*60*12)), image: 'https://placeimg.com/640/360/food', location: 'Local Market', status: 'new' },
      { id: 'b2', title: 'AC Repair Services', description: 'Quick and reliable home AC repair.', category: 'business', postedAt: iso(new Date(now.getTime()-1000*60*60*36)), image: 'https://placeimg.com/640/360/tech', location: 'City Center', status: 'viewed' },
    ];

    this.yogaStudios = [
      { id: 'y1', title: 'Sunrise Yoga Studio - Intro Course', description: 'Beginner friendly 4-week course.', category: 'yoga', postedAt: iso(new Date(now.getTime()-1000*60*60*6)), image: 'https://placeimg.com/640/360/people', location: 'Wellness Ave', status: 'in-progress' },
    ];

    this.others = [
      { id: 'o1', title: 'Local Food Festival', description: 'Street food festival this weekend.', category: 'other', postedAt: iso(new Date(now.getTime()-1000*60*60*80)), image: 'https://placeimg.com/640/360/food', status: 'viewed' },
    ];
  }

  // navigate to detailed listing page for that category
  onShowMore(category: string) {
    // Example routes: /dashboard/real-estate  /dashboard/business etc.
    this.router.navigate(['/dashboard', category]);
  }

  // Open detail view for item
  openItem(item: DashboardItem) {
    this.router.navigate(['/item', item.category, item.id]);
  }

  // small helper for friendly date
  prettyDate(iso: string) {
    return new Date(iso).toLocaleString();
  }
}





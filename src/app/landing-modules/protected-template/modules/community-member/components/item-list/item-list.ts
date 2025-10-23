import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-item-list',
  standalone: false,
  templateUrl: './item-list.html',
  styleUrl: './item-list.scss'
})
export class ItemList {
sections = ['Real Estate', 'Yoga Studio', 'Retail Store', 'Other Classifieds'];
  activeSection = this.sections[0];
  searchText = '';
  selectedItem: any = null;

  data :any = {
    'Real Estate': [
      { id: 1, title: 'Luxury Apartment', shortDesc: '3BHK sea view', details: 'A premium 3BHK apartment near the beach with modern interiors and parking.' },
      { id: 2, title: 'Downtown Office', shortDesc: 'Prime location', details: 'Spacious commercial space in the city center with excellent connectivity.' }
    ],
    'Yoga Studio': [
      { id: 3, title: 'Morning Flow', shortDesc: '6AM - 7AM', details: 'A refreshing vinyasa flow to start your day with energy and mindfulness.' },
      { id: 4, title: 'Weekend Retreat', shortDesc: '2-day session', details: 'A peaceful weekend yoga retreat in the hills with guided meditation.' }
    ],
    'Retail Store': [
      { id: 5, title: 'New Arrivals', shortDesc: 'Autumn collection', details: 'Latest fashion trends with vibrant colors and sustainable fabrics.' },
      { id: 6, title: 'Discount Offers', shortDesc: 'Up to 40% off', details: 'Exciting seasonal discounts on select items for a limited time.' }
    ],
    'Other Classifieds': [
      { id: 7, title: 'Used Car Sale', shortDesc: '2019 model sedan', details: 'Well-maintained, single-owner car with full service history and insurance.' },
      { id: 8, title: 'Home Tutor', shortDesc: 'Math & Science', details: 'Experienced tutor available for home sessions, grades 8–12.' },
      { id: 9, title: 'Freelance Designer', shortDesc: 'Logo & branding', details: 'Creative freelance designer available for logo, poster, and web design work.' }
    ]
  };

  getFilteredItems() {
    const items = this.data[this.activeSection] || [];
    return items.filter((item:any) =>
      item.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
      item.shortDesc.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  selectItem(item: any) {
    this.selectedItem = item;
  }

  isMobileView = window.innerWidth < 768;

@HostListener('window:resize', [])
onResize() {
  this.isMobileView = window.innerWidth < 768;
}
}

// File: src/app/all-requests/all-requests.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type PendingItem = {
  id: string;
  name: string;
  type: string;
  date: string; // ISO or readable
  summary?: string;
  source?: string; // category key, e.g., 'users', 'properties'
  adminStatus?: 'Accepted' | 'Rejected' | 'Custom' | null;
  adminComment?: string | null;
  extraField1?: string | null;
  extraField2?: string | null;
};

@Component({
  selector: 'app-all-requests',
  standalone: false,
  templateUrl: './all-requests-component.html',
})
export class AllRequestsComponent {
  // --- categories shown in sidebar ---
  categories = [
    { key: 'all', label: 'All' },
    { key: 'users', label: 'User Registrations' },
    { key: 'properties', label: 'Properties' },
    { key: 'community', label: 'Community Requests' },
    { key: 'business', label: 'Small Business Events/Offers' },
    { key: 'scout', label: 'Scout - Landlord' },
  ];


  // --- unified mock dataset (combine / replace with API) ---
  items: PendingItem[] = [
    {
      id: 'u1',
      name: 'Anita Sharma',
      type: 'Tenant',
      date: '2025-10-14',
      summary: 'New user from Mysore',
      source: 'users',
    },
    {
      id: 'u2',
      name: 'Ravi Kumar',
      type: 'Owner',
      date: '2025-10-13',
      summary: 'Verified phone',
      source: 'users',
    },

    {
      id: 'p1',
      name: '2BHK in Jayanagar',
      type: 'New Listing',
      date: '2025-10-15',
      summary: 'Added 6 photos, price updated',
      source: 'properties',
    },
    {
      id: 'p2',
      name: 'Whitefield Villa update',
      type: 'Update',
      date: '2025-10-11',
      summary: 'Changed description & price',
      source: 'properties',
    },

    {
      id: 'c1',
      name: 'Plumbing help - 2nd Cross',
      type: 'Plumber Request',
      date: '2025-10-12',
      summary: 'Urgent leak repair',
      source: 'community',
    },
    {
      id: 'c2',
      name: 'Pre-owned WagonR',
      type: 'Car Sell Request',
      date: '2025-10-10',
      summary: 'Good condition, single owner',
      source: 'community',
    },

    {
      id: 'b1',
      name: 'Yoga Studio - Launch Offer',
      type: 'Event/Offer',
      date: '2025-10-09',
      summary: 'Opening discounts for first 50',
      source: 'business',
    },
    {
      id: 'b2',
      name: 'Cafe - Weekend Brunch',
      type: 'Update',
      date: '2025-10-08',
      summary: 'New menu added',
      source: 'business',
    },

    {
      id: 's1',
      name: 'Scout - Add landlord Mr. Reddy',
      type: 'Add Landlord',
      date: '2025-10-07',
      summary: 'New landlord for Indiranagar',
      source: 'scout',
    },
    {
      id: 's2',
      name: 'Scout - Edit landlord contact',
      type: 'Edit Landlord',
      date: '2025-10-06',
      summary: 'Updated phone number',
      source: 'scout',
    },
  ];
  selectedCategory = '';
  selectedUserType = '';

  applyFilters() {
    console.log('Filtering for:', this.selectedCategory, this.selectedUserType);
    // Filter your main data list here:
    // this.filteredItems = this.items.filter(item => ...);
  }
  // --- signals for UI state ---
  activeCategory = signal<'all' | 'users' | 'properties' | 'community' | 'business' | 'scout'>(
    'all'
  );
  // modal signals
  isModalOpen = signal(false);
  selectedItem = signal<PendingItem | null>(null);
  responseType = signal<'accept' | 'reject' | 'custom'>('accept');
  comment = signal('');

  // sidebar collapsed on mobile
  sidebarOpen = signal(false);

  // derived list for template
  get filteredItems() {
    const cat = this.activeCategory();
    return this.items
      .filter((i) => (cat === 'all' ? true : i.source === cat))
      .slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || '')); // latest first
  }

  // --- interactions ---
  setCategory(key: any) {
    this.activeCategory.set(key);
    this.sidebarOpen.set(false); // auto-close sidebar on mobile
  }

  openRespondModal(item: PendingItem) {
    // set shallow copy
    this.selectedItem.set({ ...item });
    this.responseType.set('accept');
    this.comment.set(item.adminComment ?? '');
    this.isModalOpen.set(true);
    document.documentElement.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen.set(false);
    setTimeout(() => {
      this.selectedItem.set(null);
      this.comment.set('');
      document.documentElement.style.overflow = '';
    }, 220);
  }
  getCategoryCount(key: string): number {
    if (!this.items) return 0;
    if (key === 'all') return this.items.length;
    return this.items.filter((i) => i && i.source === key).length;
  }
  // Signal to track which item is expanded (store item id)
  expandedItem = signal<string | null>(null);

  // Toggle expand/collapse for details preview
  toggleDetails(itemId: string) {
    // open the clicked item, or close if already open
    this.expandedItem.set(this.expandedItem() === itemId ? null : itemId);
  }

  saveResponse() {
    const si = this.selectedItem();
    if (!si) {
      this.closeModal();
      return;
    }

    const status =
      this.responseType() === 'accept'
        ? 'Accepted'
        : this.responseType() === 'reject'
        ? 'Rejected'
        : 'Custom';

    // update the real item in items[]
    const idx = this.items.findIndex((x) => x.id === si.id);
    if (idx > -1) {
      this.items[idx] = {
        ...this.items[idx],
        adminStatus: status as PendingItem['adminStatus'],
        adminComment: this.comment() ?? null,
      };
    }

    // TODO: call backend API here to persist the response

    this.closeModal();
  }
}

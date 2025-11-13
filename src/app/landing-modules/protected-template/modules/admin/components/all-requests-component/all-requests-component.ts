// File: src/app/all-requests/all-requests.component.ts
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { AdminApiService } from '../../services/admin-api';

export type PendingItem = {
  id: string;
  title?: string;
  name?: string;
  type?: string;
  date?: string; // ISO or readable
  createdAt?: string; // original API createdAt
  summary?: string;
  details?: string;
  source?: string; // normalized category key, e.g., 'users', 'properties'
  adminStatus?: 'Accepted' | 'Rejected' | 'Custom' | null;
  adminComment?: string | null;
  extraField1?: string | null;
  extraField2?: string | null;

  // original/raw fields preserved for debugging if needed
  _raw?: any;

  // other commonly used fields
  ownerName?: string;
  userId?: string;
  propertyUserId?: string;
  businessId?: string;
  yogaStudioId?: string;

  // media
  photos_urls?: string[];
  photos_keys?: string[];
  videos_urls?: string[];
  videos_keys?: string[];

  // approval index raw
  _approval_index?: any;
};

@Component({
  selector: 'app-all-requests',
  standalone: false,
  templateUrl: './all-requests-component.html', // <- corrected file name
})
export class AllRequestsComponent implements OnInit {
  pageNumber = 1;
  pageSize = 15;
  totalPages = 1;
  nextCursor: string | null = null;
  loading = false;

  // page size options for UI
  pageSizeOptions = [5,10, 15, 25, 50];
  constructor(private adminApiService: AdminApiService, private cdr : ChangeDetectorRef) {}

  ngOnInit() {
    this.loadPage(1);
    this.adminApiService.getRequest().subscribe({
      next: (response: any) => {
        console.log('Table Data', response);
        if (response && response.items && response.items.length) {
          // normalize each incoming item to the shape template expects
          this.items = response.items.map((it: any) => this.normalizeItem(it));
          // if there are mock items earlier, we replace with API items
         
          this.filteredItemsCache = null; // clear any cache
           const y = this.filteredItems;
           this.loading= false;
           this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('❌ Error fetching requests:', error);
      },
    });
  }

  postResponse(data: any) {
    // if your existing logic differs keep it but ensure you call loadPage on success
    this.adminApiService.postRespons(data).subscribe({
      next: (response: any) => {
        console.log('Post response', response);
        // reload current page to reflect changes
        this.loadPage(this.pageNumber, this.nextCursor);
      },
      error: (error: any) => {
        console.error('❌ Error posting response:', error);
      }
    });
  }

loadPage(page: number = 1, cursor: string | null = null) {
    this.loading = true;
    this.pageNumber = page;
    // pass pagination and filter params to API - adapt keys if your AdminApiService expects different names
    const params: any = {
      page_number: this.pageNumber,
      page_size: this.pageSize,
      nextCursor: cursor,
    };
    if (cursor) params.cursor = cursor;
    // if you want to send explicit filter params, include them:
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.selectedUserType) params.userType = this.selectedUserType;

    this.adminApiService.getRequest(params).subscribe({
      next: (response: any) => {
        // API response expected shape:
        // { items: [...], next_cursor: string|null, page_number: number, page_size: number, total_pages: number }
        this.loading = false;
        if (response && Array.isArray(response.items)) {
          this.items = response.items.map((it: any) => this.normalizeItem(it));
        } else {
          this.items = [];
        }

        // update pagination state defensively
        this.nextCursor = response.next_cursor ?? null;
        this.pageNumber = response.page_number ?? this.pageNumber;
        this.pageSize = response.page_size ?? this.pageSize;
        this.totalPages = response.total_pages ?? 1;

        this.filteredItemsCache = null; // ensure UI re-evaluates
        this.cdr.detectChanges();
      },

      error: (error: any) => {
        this.loading = false;
        console.error('❌ Error fetching requests:', error);
         this.cdr.detectChanges();
      },
    });
  }

  // --- categories shown in sidebar ---
  categories = [
    { key: 'all', label: 'All' },
    { key: 'users', label: 'User Registrations' },
    { key: 'properties', label: 'Properties' },
    { key: 'community', label: 'Community Requests' },
    { key: 'business', label: 'Small Business Events/Offers' },
    { key: 'scout', label: 'Scout - Landlord' },
  ];

  // --- master list (will be replaced by API in ngOnInit if available) ---
  items: any = [];

  // UI selection binds
  selectedCategory = '';
  selectedUserType = '';

  // small cache if you want to store filtered results (not strictly required)
  private filteredItemsCache: any| null = null;

  applyFilters() {
    const cat = this.selectedCategory || 'all';
    this.activeCategory.set(cat as any);
    this.filteredItemsCache = null;
    // reset to first page when filters change
    this.loadPage(1, null);
  }

  // --- signals for UI state ---
  activeCategory = signal<'all' | 'users' | 'properties' | 'community' | 'business' | 'scout'>('all');

  // modal signals
  isModalOpen = signal(false);
  selectedItem = signal<any>(null);
  responseType = signal<'accept' | 'reject' | 'custom'>('accept');
  comment = signal('');

  // sidebar collapsed on mobile
  sidebarOpen = signal(false);

  // Signal to track which item is expanded (store item id)
  expandedItem = signal<string | null>(null);

  // --- utility helpers ---

  /**
   * Normalize backend item into shape used by template.
   * Preserves _raw for debugging.
   */
  normalizeItem(raw: any): any {
    const item: any = { _raw: raw, _approval_index: raw._approval_index || raw['_approval_index'] || null };

    // id
    item.id = raw.propertyId || raw.id || raw.itemId || raw.propertyId || raw._rawId || '';

    // title / name
    item.title = raw.title || raw.name || raw.details || raw.summary || '';
    item.name = raw.name || raw.ownerName || raw.title || item.title;

    // type / date
    item.type = raw.type || raw.requestType || (raw._approval_index && raw._approval_index.title) || '';
    item.createdAt = raw.createdAt || raw._approval_index?.createdAt || raw.date || null;
    item.date = item.createdAt || raw.date || null;

    // summary / details
    item.summary = raw.summary || (typeof raw.details === 'string' ? raw.details : '') || null;
    item.details = raw.details || raw.description || raw.detailsText || null;

    // owner/user ids
    item.propertyUserId = raw.propertyUserId || raw.userId || raw.ownerId || raw.propertyOwnerId || null;
    item.userId = raw.userId || raw.ownerId || null;
    item.businessId = raw.businessId || raw.businessOwnerId || null;
    item.yogaStudioId = raw.yogaStudioId || null;
    item.ownerName = raw.ownerName || raw.userName || raw.owner || null;
    item.communityUserId = raw.communityUserId || null;
    // approval/status
    item.adminStatus = raw.adminStatus || raw.approval || raw._approval_index?.approval || null;
    item.adminComment = raw.adminComment || raw._approval_index?.adminComment || null;

    // media
    item.photos_urls = raw.photos_urls || raw.photosKeys || raw.photos_keys || raw.photos || [];
    item.photos_keys = raw.photos_keys || raw.photosKeys || [];
    item.videos_urls = raw.videos_urls || raw.videos_keys || raw.videos || [];
    item.videos_keys = raw.videos_keys || [];

    // normalized source/category
    // prefer _approval_index.sourceTable (mapped to simpler keys)
    const src = (raw._approval_index && raw._approval_index.sourceTable) || raw.source || raw.sourceTable || raw.category || null;
    item._approval_index = raw._approval_index || raw['_approval_index'] || null;

    item.source = this.normalizeSourceKey(src);

    return item ;
  }

  private normalizeSourceKey(src: string | null): string {
    if (!src) return 'unknown';
    const s = ('' + src).toLowerCase();
    if (s.includes('property') || s.includes('propertydetails')) return 'properties';
    if (s.includes('business') || s.includes('businessdetails')) return 'business';
    if (s.includes('yoga')) return 'business'; // treat yoga studio as business viewable in business category (template also shows yoga badge)
    if (s.includes('user') || s.includes('users') || s.includes('registration')) return 'users';
    if (s.includes('community')) return 'community';
    if (s.includes('scout')) return 'scout';
    return 'unknown';
  }

  /**
   * Infer a compact user-type key for filtering (propertyOwner, businessOwner, yogaStudio, community, scout)
   */
  getUserType(item: any): string {
    if (!item) return 'user';
    if (item.propertyUserId) return 'propertyOwner';
    if (item.businessId) return 'businessOwner';
    if (item.yogaStudioId) return 'yogaStudio';
    if (item.source === 'scout') return 'scout';
    if (item.userId) return 'community';
    return 'user';
  }

  getCategory(item: PendingItem): string {
    return item.source || 'unknown';
  }

  // --- derived list for template ---
  // the template expects "filteredItems" to be an array (used for length check and ngFor)
  get filteredItems(): any {
    // if cached, return
    if (this.filteredItemsCache) return this.filteredItemsCache;

    const chosenCategory = this.selectedCategory || this.activeCategory();
    const chosenUserType = this.selectedUserType || '';

    // copy & filter
    let list = (this.items || []).slice();

    // normalize if any raw objects slipped in (defensive)
    list = list.map((i: any) => (i && i.id ? i : this.normalizeItem(i)));

    // apply category filter (if any)
    if (chosenCategory && chosenCategory !== 'all') {
      list = list.filter((it: PendingItem) => (it.source || '').toLowerCase() === (chosenCategory || '').toLowerCase());
    }

    // apply user-type filter (if any)
    if (chosenUserType) {
      list = list.filter((it: PendingItem) => this.getUserType(it) === chosenUserType);
    }

    // sort by date descending (newest first)
    list.sort((a: any, b: any) => {
      const ad = a.createdAt || a.date || '';
      const bd = b.createdAt || b.date || '';
      const at = isNaN(Date.parse(ad)) ? 0 : Date.parse(ad);
      const bt = isNaN(Date.parse(bd)) ? 0 : Date.parse(bd);
      return bt - at;
    });

    // cache for quick repeated access within same tick (optional)
    this.filteredItemsCache = list;
    return list;
  }

  // --- interactions ---
  setCategory(key: any) {
    this.activeCategory.set(key);
    this.sidebarOpen.set(false); // auto-close sidebar on mobile
    this.selectedCategory = ''; // clear manual select to avoid confusion; UI still shows selection if you prefer keep it
    this.filteredItemsCache = null;
  }

  openRespondModal(item: any) {
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
    return this.items.filter((i: any) => (i && (i.source || '').toLowerCase() === key.toLowerCase())).length;
  }

  toggleDetails(itemId: string) {
    this.expandedItem.set(this.expandedItem() === itemId ? null : itemId);
  }

  saveResponse() {
    const si = this.selectedItem();
    if (!si) {
      this.closeModal();
      return;
    }

    const status =
      this.responseType() === 'accept' ? 'approved' : this.responseType() === 'reject' ? 'rejected' : 'custom';

    let inp: any = {
      sourceTable: si._approval_index.sourceTable,
      approval: status,
      itemId : si._approval_index.itemId,
      userId : si.userId,
      comment: this.comment()
    };

    // switch (si._approval_index.sourceTable) {
    //   case 'PropertyDetails':
    //     inp['propertyId'] = si._approval_index.itemId;
    //     inp['userId'] = si._approval_index.propertyUserId;
    //     break;
    //   case 'BusinessOwnerDetails':
    //     inp['itemId'] = si._approval_index.itemId;
    //      inp['userId'] = si._approval_index.bussinessUserId;
    //     break;
    //   case 'YogaStudioDetails':
    //     inp['yogaStudioId'] = si._approval_index.itemId;
    //      inp['userId'] = si._approval_index.studioUserId;
    //     break;
    //   case 'Users':
    //     inp['userId'] = si._approval_index.itemId;
    //     break;
    // }

    this.adminApiService.postRespons(inp).subscribe({
      next: (response: any) => {
        // close modal and refresh current page
        this.closeModal();
        this.loadPage(this.pageNumber, this.nextCursor);
      },
      error: (error: any) => {
        this.closeModal();
        console.error('❌ Error posting response:', error);
      },
    });
  }
  goToPrevious() {
    if (this.pageNumber > 1) this.loadPage(this.pageNumber - 1);
  }

  goToNext() {
    if (this.pageNumber < this.totalPages) {
      // if cursor-based, pass nextCursor; otherwise page number is enough
      this.loadPage(this.pageNumber + 1, this.nextCursor);
    }
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.cdr.detectChanges();
    this.loadPage(1); // reset to first page when size changes
  }
}

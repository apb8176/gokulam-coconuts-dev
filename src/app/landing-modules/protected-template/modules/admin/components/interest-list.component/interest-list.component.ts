// interest-list.component.ts
import { Component, HostListener } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';

interface InterestItem {
  enquiry: {
    enquiryId: string;
    userId?: string;
    enquirerUserId?: string;
    interest?: boolean;
    enquires?: string;
    createdAt?: string;
    status?: string;
    ownerUserId?: string;
  };
  member: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    communityUserId?: string;
    comment?: string;
    [k: string]: any;
  };
}

interface InterestResponse {
  count: number;
  items: InterestItem[];
  nextToken: string | null;
}

@Component({
  selector: 'app-interest-list-modal',
  templateUrl: './interest-list.component.html',
  standalone:false
})
export class InterestListComponent {
  // modal state
  isOpen = false;

  // data
  items: InterestItem[] = [];
  total = 0;
  pageSize = 15;
  currentPage = 1;
  totalPages = 1;

  // token map for page -> token used to fetch that page (cursor paging)
  tokens: Map<number, string | null> = new Map();
  lastResponseNextToken: string | null = null;

  // loading / error
  loading = false;
  error: string | null = null;

  // active enquiry id
  activeEnquiryId?: string;

  // hold subscription
  private sub?: Subscription;

  // BASE API URL (adjust to your backend)
  private readonly baseUrl = '/api/enquiries'; // <- change if required

  constructor(private http: HttpClient) {}

  /**
   * Open the modal and load first page for given enquiryId
   */
  open(enquiry: any) {
    this.activeEnquiryId = enquiry;
    this.isOpen = true;
    //this.resetPaging();
    this.items = enquiry.items;
    console.log(enquiry);
    
    //this.fetchPage(1);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.items = [];
    this.activeEnquiryId = undefined;
    this.resetPaging();
    document.body.style.overflow = '';
    if (this.sub) this.sub.unsubscribe();
  }

  private resetPaging() {
    this.items = [];
    this.total = 0;
    this.currentPage = 1;
    this.totalPages = 1;
    this.tokens.clear();
    this.lastResponseNextToken = null;
    this.tokens.set(1, null);
  }

  /**
   * Inlined API call: fetch page for the current enquiry
   * We use GET with query params limit=15 and pageToken (cursor)
   * Change to POST if your backend requires body-based cursor paging.
   */
  private fetchPage(page: number) {
    if (!this.activeEnquiryId) return;
    this.loading = true;
    this.error = null;

    const tokenForPage = this.tokens.get(page);
    // If tokenForPage undefined and page > current, try lastResponseNextToken
    const pageTokenToUse = tokenForPage !== undefined ? tokenForPage : this.lastResponseNextToken;

    // Build URL and params
    const url = `${this.baseUrl}/${encodeURIComponent(this.activeEnquiryId)}/interests`;
    let params = new HttpParams().set('limit', String(this.pageSize));
    if (pageTokenToUse) params = params.set('pageToken', pageTokenToUse);

    // If your backend expects an enquiryId in body or different endpoint, modify above accordingly.
    // this.sub = this.http.get<InterestResponse>(url, { params }).subscribe({
    //   next: (res) => {
    //     this.loading = false;
    //     this.items = res.items || [];
    //     this.total = res.count ?? (this.items.length || 0);
    //     this.lastResponseNextToken = res.nextToken ?? null;

    //     // store token used to fetch this page
    //     this.tokens.set(page, pageTokenToUse ?? null);

    //     // store next page token (for page+1) if present
    //     if (res.nextToken) {
    //       this.tokens.set(page + 1, res.nextToken);
    //     } else {
    //       this.tokens.delete(page + 1);
    //     }

    //     this.currentPage = page;
    //     this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    //   },
    //   error: (err) => {
    //     this.loading = false;
    //     this.error = 'Failed to load interested users. Please try again.';
    //     console.error('fetchPage error', err);
    //   },
    // });
  }

  prevPage() {
    if (this.currentPage > 1 && !this.loading) {
      this.fetchPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage >= this.totalPages || this.loading) return;
    const nextPage = this.currentPage + 1;

    // If token exists for next page or we have lastResponseNextToken, allow fetch
    if (this.tokens.has(nextPage) || this.lastResponseNextToken) {
      this.fetchPage(nextPage);
    }
  }

  formatDate(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // close modal on ESC
  @HostListener('window:keydown.escape', ['$event'])
  onEsc(event: Event) {
    if (this.isOpen) {
      this.close();
    }
  }
}

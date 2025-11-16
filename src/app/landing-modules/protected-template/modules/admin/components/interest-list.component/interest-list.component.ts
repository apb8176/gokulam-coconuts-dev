// interest-list.component.ts
import { ChangeDetectorRef, Component, HostListener, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AdminApiService } from '../../services/admin-api';

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
    // messages could be present here in some payloads
    messages?: Array<{ responderRole?: string; message?: string; createdAt?: string; [k: string]: any }>;
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
  // top-level messages (some APIs keep them here)
  messages?: Array<{ responderRole?: string; message?: string; createdAt?: string; [k: string]: any }>;
  // any other fields
  [k: string]: any;
}

interface InterestResponse {
  count: number;
  items: InterestItem[];
  nextToken: string | null;
}

@Component({
  selector: 'app-interest-list-modal',
  templateUrl: './interest-list.component.html',
  standalone: false,
})
export class InterestListComponent implements OnDestroy {
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

  // Chat history panel state
  historyOpen = false;
  selectedMessages: any = [];
  selectedEnquiryLabel = '';

  constructor(private http: HttpClient, private adminApiService : AdminApiService, private cdr : ChangeDetectorRef) {
  //  this.selectedMessages = [
  //       {        
            
         
  //           "responderRole": "ENQUIRER",
  //           "message": "Hello Canada Steel and Casing IMPORTS Inc,\n\nI am interested",
  //           "createdAt": "2025-11-14T21:03:25.216511Z"
           
  //       },
  //       {
           
  //           "responderRole": "ADMIN",
  //           "message": "Thanks — please call 98765xxxx for details",
  //           "createdAt": "2025-11-16T18:47:28.754599Z"
  //       }
  //   ]
  }

  /**
   * Open the modal and load first page for given enquiryId or data object
   * 'enquiry' param can be an id string or a payload object (defensive)
   */
  open(enquiry: any) {
    this.activeEnquiryId = typeof enquiry === 'string' ? enquiry : enquiry.enquiryId ?? enquiry.activeEnquiryId;
    this.isOpen = true;

    // If caller passed a payload object containing items (e.g., { items: [...] }) use it directly
    if (enquiry && Array.isArray(enquiry.items)) {
      this.items = enquiry.items;
      this.total = enquiry.count ?? this.items.length;
    } else {
      // otherwise reset items and optionally fetch
      // this.resetPaging();
      // this.fetchPage(1);
      this.items = [];
    }

    console.log('interest modal opened for', enquiry);

    // lock body scroll while modal open
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.items = [];
    this.activeEnquiryId = undefined;
    this.resetPaging();

    // also close history panel if open
    this.closeHistory();

    document.body.style.overflow = '';
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
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

    // Example GET call - commented out until you wire your API
    // this.sub = this.http.get<InterestResponse>(url, { params }).subscribe({
    //   next: (res) => {
    //     this.loading = false;
    //     this.items = res.items || [];
    //     this.total = res.count ?? (this.items.length || 0);
    //     this.lastResponseNextToken = res.nextToken ?? null;
    //
    //     // store token used to fetch this page
    //     this.tokens.set(page, pageTokenToUse ?? null);
    //
    //     // store next page token (for page+1) if present
    //     if (res.nextToken) {
    //       this.tokens.set(page + 1, res.nextToken);
    //     } else {
    //       this.tokens.delete(page + 1);
    //     }
    //
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

  /**
   * Open chat history side-panel for the given interest item.
   * Looks in several possible locations for messages (defensive).
   * Only maps responderRole, message, createdAt fields.
   */
  openHistory(item: InterestItem | any) {
    // Defensive lookup for messages array
    // const possible =
    //   (item?.messages && Array.isArray(item.messages) && item.messages) ||
    //   (item?.enquiry?.messages && Array.isArray(item.enquiry.messages) && item.enquiry.messages) ||
    //   (item?.chat?.messages && Array.isArray(item.chat.messages) && item.chat.messages) ||
    //   [];

    //const msgs = Array.isArray(possible) ? possible : [];
    this.getHistory(item.enquiry.userId,item.enquiry.enquirerUserId,item);
    // Map to minimal structure required and preserve orderss
    
  }
  getHistory(userId: any, enquirerUserId: any,item:any) {
    this.adminApiService.getHistory(userId,enquirerUserId).subscribe({
      next: (response: { messages: any[] }) => {
        console.log('✅ Property added successfully:', response);
        this.loading = false;
        this.cdr.detectChanges();
      
        const msgs:any =  response.messages;
    // Map to minimal structure required and preserve order
    this.selectedMessages = msgs.map((m: any) => ({
      responderRole: m.responderRole ?? m.role ?? '—',
      message: m.message ?? m.text ?? '—',
      createdAt: m.createdAt ?? m.created_at ?? m.time ?? ''
    }));

    // Label for header: prefer name -> email -> phone -> enquiryId
    const name =
      item?.member?.firstName ||
      item?.member?.email ||
      item?.member?.phone ||
      item?.enquiry?.enquiryId ||
      item?.enquiryId ||
      'User';

    this.selectedEnquiryLabel = `${name}`;

    // Open panel and ensure body remains locked
    this.historyOpen = true;
    document.body.style.overflow = 'hidden';

    // Scroll panel body to top (after next tick)
    setTimeout(() => {
      const panelBody = document.querySelector('aside .p-4');
      if (panelBody) (panelBody as HTMLElement).scrollTop = 0;
    }, 60);      
      },
      error: (error: any) => {
        this.loading = false;
        console.error('❌ Error adding property:', error);
        this.cdr.detectChanges();
      },
      complete: () => {
        this.cdr.detectChanges();
      },
    });
  }

  closeHistory() {
    this.historyOpen = false;
    // restore body scroll only if modal not open
    if (!this.isOpen) {
      document.body.style.overflow = '';
    } else {
      // keep overflow hidden when modal still open
      document.body.style.overflow = 'hidden';
    }

    // keep selectedMessages for UX; clear if you prefer:
    // this.selectedMessages = [];
    // this.selectedEnquiryLabel = '';
  }

  formatDate(iso?: string) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return iso;
    }
  }

  // close modal on ESC - also close history if open
  @HostListener('window:keydown.escape', ['$event'])
  onEsc(event: Event) {
    if (this.historyOpen) {
      this.closeHistory();
      return;
    }
    if (this.isOpen) {
      this.close();
    }
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
    // ensure body overflow restored
    document.body.style.overflow = '';
  }
}

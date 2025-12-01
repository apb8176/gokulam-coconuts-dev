import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { PoApi } from '../../services/po-api';
import { MultipartUpload } from '../../services/multipart-upload';

@Component({
  selector: 'app-bo-post-list',
  standalone: false,
  templateUrl: './property-owner-post-list.html',
  styleUrl: './property-owner-post-list.scss',
})
export class PropertyOwnerPostList {
  response: any;
  postList: any = [];
  isLoading = false; // 🟢 Loader state

  constructor(
    private router: Router,
    private propertyService: PoApi,
    private cdr: ChangeDetectorRef,
    private uploadService: MultipartUpload
  ) {}

  ngOnInit() {
    this.getPropertyList();
  }

  navigateToForm() {
    this.uploadService.setSelectedItem(null);
    this.router.navigateByUrl('landing/property-owner/details');
  }

  goToDetails(item: any) {
    const sItem = this.response.find((x: any) => x.propertyId === item.id);
    this.uploadService.setSelectedItem(sItem);
    this.router.navigateByUrl('/landing/property-owner/details');
  }

  getPropertyList() {
    this.isLoading = true; // 🟡 Start loading
    this.propertyService.getPropertyList().subscribe({
      next: (response: any) => {
        this.response = response.items;
        this.postList = response.items.map((item: any) => ({
          propertyName: item.propertyName,
          status: item.status,
          id: item.propertyId,
          postedOn: item.createdAt,
          location: item.address,
          description: item.details,
          action: 'View',
        }));
        
        this.isLoading = false; // 🟢 Stop loading
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('❌ Error fetching properties:', error);
        this.isLoading = false;
        this.cdr.detectChanges(); // 🔴 Stop loading on error
      },
    });
  }
}

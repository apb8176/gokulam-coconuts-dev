import { ChangeDetectorRef, Component } from '@angular/core';
import { postList } from '../../../../models/sampleData';
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
    this.router.navigateByUrl('landing/property-owner/details');
  }
  postList: any = [];
  goToDetails(_t8: any) {
    
    let sItem = this.response.filter((item: any) => item.propertyId === _t8.id)[0];
    this.uploadService.setSelectedItem(sItem);
    this.router.navigateByUrl('/landing/property-owner/details');
  }
  getPropertyList() {
    this.propertyService.getPropertyList().subscribe({
      next: (response: any) => {
        this.response = response.items;
        this.postList = response.items.map((item: any) => {
          return {
            propertyName: item.propertyName,
            status: item.status,
            id: item.propertyId,
            postedOn: item.createdAt,
            location: item.address,
            description: item.details,
            action: 'View',
          };
        });
        console.log('Table Data', this.postList);
        this.cdr.detectChanges();
        console.log('✅ Property added successfully:', this.postList);
      },
      error: (error: any) => {
        console.error('❌ Error adding property:', error);
      },
    });
  }
}

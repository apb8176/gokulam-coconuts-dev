import { Component } from '@angular/core';
import { postList } from '../../../../models/sampleData';
import { Router } from '@angular/router';
import { PoApi } from '../../services/po-api';

@Component({
  selector: 'app-bo-post-list',
  standalone: false,
  templateUrl: './property-owner-post-list.html',
  styleUrl: './property-owner-post-list.scss'
})
export class PropertyOwnerPostList {
  constructor(private router: Router, private propertyService : PoApi) {}
  ngOnInit(){
    this.getPropertyList();
  }


navigateToForm() {
  this.router.navigateByUrl('landing/property-owner/details');
}
    postList :any[]=postList;

getPropertyList() {
   this.propertyService.getPropertyList().subscribe({
      next: (response: any) => {
        console.log('✅ Property added successfully:', response);
      },
      error: (error:any) => {
        console.error('❌ Error adding property:', error);
      }
    });
}
}



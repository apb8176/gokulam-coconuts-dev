import { Component } from '@angular/core';
import { postList } from '../../../../models/sampleData';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bo-post-list',
  standalone: false,
  templateUrl: './property-owner-post-list.html',
  styleUrl: './property-owner-post-list.scss'
})
export class PropertyOwnerPostList {
  constructor(private router: Router) {}
navigateToForm() {
  this.router.navigateByUrl('landing/property-owner/details');
}
    postList :any[]=postList;
}

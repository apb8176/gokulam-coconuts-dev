import { Component } from '@angular/core';
import { postList } from '../../../../models/sampleData';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bo-post-list',
  standalone: false,
  templateUrl: './bo-post-list.html',
  styleUrl: './bo-post-list.scss'
})
export class BoPostList {
  constructor(private router: Router) {}
navigateToForm() {
  this.router.navigateByUrl('landing/property-owner/details');
}
    postList :any[]=postList;
}

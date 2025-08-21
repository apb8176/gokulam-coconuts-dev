import { Component } from '@angular/core';
import { postList } from '../../../../models/sampleData';

@Component({
  selector: 'app-bo-post-list',
  standalone: false,
  templateUrl: './bo-post-list.html',
  styleUrl: './bo-post-list.scss'
})
export class BoPostList {
    postList :any[]=postList;
}

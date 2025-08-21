import { Component } from '@angular/core';

@Component({
  selector: 'app-public-template',
  standalone:false,
  templateUrl: './public-template.html',
  styleUrl: './public-template.scss'
})
export class PublicTemplate {
showMobileMenu: boolean = false;

}

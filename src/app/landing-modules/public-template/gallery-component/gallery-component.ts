import { Component, Input } from '@angular/core';

export interface DoggoItem {
  src: string;
  alt?: string;
  caption?: string;
}

@Component({
  selector: 'app-gallery-component',
  templateUrl: './gallery-component.html',
  styleUrls: ['./gallery-component.scss'],
  standalone: false,
})
export class GalleryComponent {
  @Input() title = 'Gallery';
  width = window.innerWidth;
  @Input() items: DoggoItem[] = [
    { src: 'https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"I'm so happy today!"` },
    { src: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"I see those nugs."` },
    { src: 'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"I love you so much!"` },
    { src: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"I'm the baby of the house!"` },
    { src: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"Are you gunna throw the ball?"` },
    { src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"C'mon friend!"` },
    { src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"A rose for mommy!"` },
    { src: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"You gunna finish that?"` },
    { src: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"We can't afford a cat!"` },
    { src: 'https://images.unsplash.com/photo-1504595403659-9088ce801e29?ixlib=rb-1.2.1&q=80&fm=jpg&w=800&fit=max', caption: `"Dis my fren!"` },
  ];
}

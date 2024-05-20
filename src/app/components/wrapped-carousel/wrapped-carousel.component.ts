import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  inject,
  Input,
  OnInit,
  QueryList,
  signal,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CarouselItemDirective } from './carousel-item.directive';

@Component({
  selector: 'wrapped-carousel',
  standalone: true,
  imports: [MatIconButton, MatIcon],
  templateUrl: './wrapped-carousel.component.html',
  styleUrls: ['./wrapped-carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WrappedCarouselComponent implements OnInit {
  @ContentChildren(CarouselItemDirective) items!: QueryList<CarouselItemDirective>;
  @Input({ required: true }) itemHeight!: number;
  @Input() showActions = true;

  scrollable = signal(false);

  private hostRef = inject(ElementRef<HTMLElement>);
  private cdr = inject(ChangeDetectorRef);

  private height!: number;
  private maxItems!: number;
  private currentPageIndex!: number;
  private pages: CarouselItemDirective[][] = [];

  ngOnInit(): void {
    new ResizeObserver(() => this.onResize()).observe(this.hostRef.nativeElement);
  }

  onResize(): void {
    this.items.forEach(i => i.destroy());

    if (this.items.length === 0) return;

    this.height = this.hostRef.nativeElement.getBoundingClientRect().height;
    if (this.height < this.itemHeight) return;

    this.maxItems = Math.floor(this.height / this.itemHeight);

    this.updatePages();
    this.scrollable.set(this.pages.length > 1);
    this.cdr.detectChanges();
    this.placePage(0);
  }

  previous(): void {
    this.destroyPage(this.currentPageIndex);
    const page = this.currentPageIndex - 1 < 0 ? this.pages.length - 1 : this.currentPageIndex - 1;
    this.placePage(page);
  }

  next(): void {
    this.destroyPage(this.currentPageIndex);
    const page = this.currentPageIndex + 1 >= this.pages.length ? 0 : this.currentPageIndex + 1;
    this.placePage(page);
  }

  private updatePages(): void {
    this.pages = new Array(Math.ceil(this.items.length / this.maxItems)).fill(0).map(() => []);
    this.items.forEach((item, i) => this.pages[Math.floor(i / this.maxItems)].push(item));
  }

  private destroyPage(pageIndex: number): void {
    this.pages[pageIndex].forEach(i => i.destroy());
  }

  private placePage(pageIndex: number): void {
    this.pages[pageIndex].forEach(i => i.place());
    this.currentPageIndex = pageIndex;
  }
}

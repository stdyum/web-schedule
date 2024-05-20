import { Directive, EmbeddedViewRef, inject, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[carouselItem]',
  standalone: true,
})
export class CarouselItemDirective {
  private templateRef = inject(TemplateRef);
  private containerRef = inject(ViewContainerRef);

  private viewRef!: EmbeddedViewRef<any>;

  place(): EmbeddedViewRef<any> {
    if (this.viewRef && !this.viewRef.destroyed) return this.viewRef;

    this.viewRef = this.containerRef.createEmbeddedView(this.templateRef);
    this.viewRef.detectChanges();
    return this.viewRef;
  }

  destroy(): void {
    if (!this.viewRef || this.viewRef.destroyed) return;

    this.viewRef.destroy();
  }
}

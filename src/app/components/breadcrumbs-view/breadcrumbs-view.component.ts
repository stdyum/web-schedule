import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslationPipe } from '@likdan/studyum-core';

@Component({
  selector: 'breadcrumbs-view',
  standalone: true,
  imports: [
    MatIcon,
    TranslationPipe,
  ],
  templateUrl: './breadcrumbs-view.component.html',
  styleUrl: './breadcrumbs-view.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsViewComponent {
  @Input({ required: true }) items!: string[];

  @Input() divider: string = 'chevron_right';
}

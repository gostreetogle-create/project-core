import { Component, input, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { TieredMenu } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'kp-tiered-menu',
  standalone: true,
  imports: [TieredMenuModule],
  template: `
    <p-tieredMenu #menu [model]="model()" [popup]="true" appendTo="body" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpTieredMenuComponent {
  model = input<MenuItem[]>([]);
  readonly menuRef = viewChild<TieredMenu>('menu');

  toggle(event: Event) {
    this.menuRef()?.toggle(event);
  }
}

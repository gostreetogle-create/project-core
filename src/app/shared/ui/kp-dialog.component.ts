import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kp-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule],
  template: `
    <p-dialog
      [header]="header()"
      [visible]="visible()"
      [modal]="modal()"
      [closable]="closable()"
      [draggable]="draggable()"
      [resizable]="resizable()"
      [style]="{ width: width() }"
      [breakpoints]="{ '600px': '90vw' }"
      (visibleChange)="visibleChange.emit($event)"
      (onHide)="dialogHide.emit()"
    >
      <ng-content />
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpDialogComponent {
  header = input('');
  visible = input(false);
  modal = input(true);
  closable = input(true);
  draggable = input(false);
  resizable = input(false);
  width = input('500px');

  readonly dialogHide = output<void>();
  readonly visibleChange = output<boolean>();
}

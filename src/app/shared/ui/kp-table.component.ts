import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { KpButtonComponent } from './kp-button.component';
import { KpBadgeComponent } from './kp-badge.component';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'badge';
}

@Component({
  selector: 'kp-table',
  standalone: true,
  imports: [CommonModule, TableModule, KpButtonComponent, KpBadgeComponent],
  template: `
    <p-table
      [value]="data()"
      [columns]="columns()"
      [rows]="rows()"
      [paginator]="paginator()"
      [loading]="loading()"
      [sortField]="sortField()"
      [sortOrder]="sortOrder()"
      [globalFilterFields]="searchFields()"
      stripedRows
      [rowsPerPageOptions]="[10, 20, 50]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Показано {first}-{last} из {totalRecords}"
    >
      <ng-template pTemplate="header" let-columns>
        <tr>
          @for (col of columns; track col.field) {
            <th [pSortableColumn]="col.sortable ? col.field : ''" [style.width]="col.width || 'auto'">
              {{ col.header }}
              @if (col.sortable) { <p-sortIcon [field]="col.field" /> }
            </th>
          }
          @if (showActions()) {
            <th style="width: 120px">Действия</th>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-rowData let-columns="columns">
        <tr>
          @for (col of columns; track col.field) {
            <td>
              @switch (col.type) {
                @case ('badge') {
                  <kp-badge [value]="rowData[col.field]" />
                }
                @default {
                  {{ rowData[col.field] }}
                }
              }
            </td>
          }
          @if (showActions()) {
            <td class="kp-table__actions">
              <kp-button
                icon="pi pi-pencil"
                severity="secondary"
                [text]="true"
                [rounded]="true"
                (buttonClick)="rowEdit.emit(rowData)"
              />
              <kp-button
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [rounded]="true"
                (buttonClick)="rowDelete.emit(rowData)"
              />
            </td>
          }
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage" let-columns>
        <tr>
          <td [attr.colspan]="columns.length + (showActions() ? 1 : 0)" class="kp-table__empty">
            {{ emptyMessage() }}
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: [`
    .kp-table__actions {
      display: flex;
      gap: 4px;
      white-space: nowrap;
    }
    .kp-table__empty {
      text-align: center;
      padding: var(--space-8) !important;
      color: var(--color-text-muted);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpTableComponent {
  data = input<unknown[]>([]);
  columns = input<TableColumn[]>([]);
  rows = input(20);
  paginator = input(true);
  loading = input(false);
  sortField = input('');
  sortOrder = input(1);
  searchFields = input<string[]>([]);
  showActions = input(true);
  emptyMessage = input('Нет данных');

  readonly rowEdit = output<unknown>();
  readonly rowDelete = output<unknown>();
}

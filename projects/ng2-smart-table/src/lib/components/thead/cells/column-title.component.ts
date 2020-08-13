import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';

import { Column } from '../../../lib/data-set/column';
import { DataSource } from '../../../lib/data-source/data-source';

@Component({
  selector: 'ng2-st-column-title',
  styles: [`
    .ng-tooltip {
      position: relative;
      display: inline-block;
    }

    .ng-tooltip .tooltiptext {
      visibility: hidden;
      width: 120px;
      background-color: #555;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px 0;
      position: absolute;
      z-index: 1;
      bottom: 125%;
      left: 50%;
      margin-left: -60px;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .ng-tooltip .tooltiptext::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 50%;
      margin-left: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: #555 transparent transparent transparent;
    }

    .ng-tooltip:hover .tooltiptext {
      visibility: visible;
      opacity: 1;
    }
  `],
  template: `
    <div class="ng2-smart-title" [ngClass]="column.tooltip && column.tooltip.enabled ? 'ng-tooltip' : ''">
      <span class="tooltiptext">{{ column.tooltip?.text }}</span>
      <ng2-smart-table-title [source]="source" [column]="column" (sort)="sort.emit($event)"></ng2-smart-table-title>
    </div>
  `,
})
export class ColumnTitleComponent {

  @Input() column: Column;
  @Input() source: DataSource;

  @Output() sort = new EventEmitter<any>();
}

import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { EventEmitter } from '@angular/core';

import { Deferred, getDeepFromObject, getPageForRowIndex } from './helpers';
import { Column } from './data-set/column';
import { Row } from './data-set/row';
import { DataSet } from './data-set/data-set';
import { DataSource } from './data-source/data-source';

export class Grid {

  createFormShown: boolean = false;

  source: DataSource;
  settings: any;
  dataSet: DataSet;

  onSelectRowSource = new Subject<any>();
	onDeselectRowSource = new Subject<any>();

  showActionColumnLeft: boolean;
  showActionColumnRight: boolean;

	private sourceOnChangedSubscription: Subscription;
	private sourceOnUpdatedSubscription: Subscription;

  public columns: Array<number> = [];

  constructor(source: DataSource, settings: any) {
    this.setSettings(settings);
    this.setSource(source);
  }

	detach(): void {
		if (this.sourceOnChangedSubscription) {
			this.sourceOnChangedSubscription.unsubscribe();
		}
		if (this.sourceOnUpdatedSubscription) {
			this.sourceOnUpdatedSubscription.unsubscribe();
		}
	}

  showActionColumn(position: string): boolean {
    return this.isCurrentActionsPosition(position) && this.isActionsVisible();
  }

  isCurrentActionsPosition(position: string): boolean {
    return position == this.getSetting('actions.position');
  }

  isActionsVisible(): boolean {
    return this.getSetting('actions.add') || this.getSetting('actions.edit') || this.getSetting('actions.delete') || this.getSetting('actions.custom').length;
  }

  isMultiSelectVisible(): boolean {
    return this.getSetting('selectMode') === 'multi';
  }

  getNewRow(): Row {
    return this.dataSet.newRow;
  }

  setSettings(settings: Object) {
    this.settings = settings;
    this.dataSet = new DataSet([], this.getSetting('columns'));

    if (this.source) {
      this.source.refresh();
    }

    this.showActionColumnLeft = this.showActionColumn('left');
    this.showActionColumnRight = this.showActionColumn('right');

    if(this.showActionColumnLeft)
    {
      this.regenerateColumns();
    }
    else if(this.showActionColumnRight)
    {
      this.regenerateColumns(false);
    }
  }

  getDataSet(): DataSet {
    return this.dataSet;
  }

  setSource(source: DataSource) {
    this.source = this.prepareSource(source);
		this.detach();

		this.sourceOnChangedSubscription = this.source.onChanged().subscribe((changes: any) => this.processDataChange(changes));

		this.sourceOnUpdatedSubscription = this.source.onUpdated().subscribe((data: any) => {
      const changedRow = this.dataSet.findRowByData(data);
      changedRow.setData(data);
    });
  }

  getSetting(name: string, defaultValue?: any): any {
    return getDeepFromObject(this.settings, name, defaultValue);
  }

  getColumns(): Array<Column> {
    return this.dataSet.getColumns();
  }

  getRows(): Array<Row> {
    return this.dataSet.getRows();
  }

  selectRow(row: Row) {
    this.dataSet.selectRow(row);
  }

  multipleSelectRow(row: Row) {
    this.dataSet.multipleSelectRow(row);
  }

  onSelectRow(): Observable<any> {
    return this.onSelectRowSource.asObservable();
  }

	onDeselectRow(): Observable<any> {
		return this.onDeselectRowSource.asObservable();
	}

  edit(row: Row) {
    row.isInEditing = true;
  }

  create(row: Row, confirmEmitter: EventEmitter<any>) {

    const deferred = new Deferred();
    deferred.promise.then((newData) => {
      newData = newData ? newData : row.getNewData();
      if (deferred.resolve.skipAdd) {
        this.createFormShown = false;
      } else {
        this.source.prepend(newData).then(() => {
          this.createFormShown = false;
          this.dataSet.createNewRow();
        });
      }
    }).catch((err) => {
      // doing nothing
    });

    if (this.getSetting('add.confirmCreate')) {
      confirmEmitter.emit({
        newData: row.getNewData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

  save(row: Row, confirmEmitter: EventEmitter<any>) {

    const deferred = new Deferred();
    deferred.promise.then((newData) => {
      newData = newData ? newData : row.getNewData();
      if (deferred.resolve.skipEdit) {
        row.isInEditing = false;
      } else {
        this.source.update(row.getData(), newData).then(() => {
          row.isInEditing = false;
        });
      }
    }).catch((err) => {
      // doing nothing
    });

    if (this.getSetting('edit.confirmSave')) {
      confirmEmitter.emit({
        data: row.getData(),
        newData: row.getNewData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

  delete(row: Row, confirmEmitter: EventEmitter<any>) {

    const deferred = new Deferred();
    deferred.promise.then(() => {
      this.source.remove(row.getData());
    }).catch((err) => {
      // doing nothing
    });

    if (this.getSetting('delete.confirmDelete')) {
      confirmEmitter.emit({
        data: row.getData(),
        source: this.source,
        confirm: deferred,
      });
    } else {
      deferred.resolve();
    }
  }

	orderChange(confirmEmitter: EventEmitter<any>)
	{
		const columnData = {};
		this.getColumns().forEach((column) => columnData[column.id] = { index: column.index, title: column.title });

		const deferred = new Deferred();
		confirmEmitter.emit({
			columns: columnData,
			confirm: deferred,
		});
	}

  processDataChange(changes: any) {
    if (this.shouldProcessChange(changes)) {
      this.dataSet.setData(changes['elements']);
      if (this.getSetting('selectMode') !== 'multi') {
        const row = this.determineRowToSelect(changes);

        if (row) {
          this.onSelectRowSource.next(row);
        } else {
					this.onDeselectRowSource.next(null);
				}
      }
    }
  }

  shouldProcessChange(changes: any): boolean {
    if (['filter', 'sort', 'page', 'remove', 'refresh', 'load', 'paging'].indexOf(changes['action']) !== -1) {
      return true;
    } else if (['prepend', 'append'].indexOf(changes['action']) !== -1 && !this.getSetting('pager.display')) {
      return true;
    }

    return false;
  }

  // TODO: move to selectable? Separate directive
  determineRowToSelect(changes: any): Row {

    if (['load', 'page', 'filter', 'sort', 'refresh'].indexOf(changes['action']) !== -1) {
			return this.dataSet.select(this.getRowIndexToSelect());
    }
    if (changes['action'] === 'remove') {
      if (changes['elements'].length === 0) {
        // we have to store which one to select as the data will be reloaded
        this.dataSet.willSelectLastRow();
      } else {
        return this.dataSet.selectPreviousRow();
      }
    }
    if (changes['action'] === 'append') {
      // we have to store which one to select as the data will be reloaded
      this.dataSet.willSelectLastRow();
    }
    if (changes['action'] === 'add') {
      return this.dataSet.selectFirstRow();
    }
    if (changes['action'] === 'update') {
      return this.dataSet.selectFirstRow();
    }
    if (changes['action'] === 'prepend') {
      // we have to store which one to select as the data will be reloaded
      this.dataSet.willSelectFirstRow();
    }
    return null;
  }

  prepareSource(source: any): DataSource {
    const initialSource: any = this.getInitialSort();
    if (initialSource && initialSource['field'] && initialSource['direction']) {
      source.setSort([initialSource], false);
    }
    if (this.getSetting('pager.display') === true) {
			source.setPaging(this.getPageToSelect(source), this.getSetting('pager.perPage'), false);
    }

    source.refresh();
    return source;
  }

  getInitialSort() {
    const sortConf: any = {};
    this.getColumns().forEach((column: Column) => {
      if (column.isSortable && column.defaultSortDirection) {
        sortConf['field'] = column.id;
        sortConf['direction'] = column.defaultSortDirection;
        sortConf['compare'] = column.getCompareFunction();
      }
    });
    return sortConf;
  }

  getSelectedRows(): Array<any> {
    return this.dataSet.getRows()
      .filter(r => r.isSelected);
  }

  selectAllRows(status: any) {
    this.dataSet.getRows()
      .forEach(r => r.isSelected = status);
  }

  getFirstRow(): Row {
    return this.dataSet.getFirstRow();
  }

  getLastRow(): Row {
    return this.dataSet.getLastRow();
  }

	private getSelectionInfo(): { perPage: number, page: number, selectedRowIndex: number, switchPageToSelectedRowPage: boolean } {
		const switchPageToSelectedRowPage: boolean = this.getSetting('switchPageToSelectedRowPage');
		const selectedRowIndex: number = Number(this.getSetting('selectedRowIndex', 0)) || 0;
		const { perPage, page }: { perPage: number, page: number } = this.getSetting('pager');
		return { perPage, page, selectedRowIndex, switchPageToSelectedRowPage };
	}

	private getRowIndexToSelect(): number {
		const { switchPageToSelectedRowPage, selectedRowIndex, perPage } = this.getSelectionInfo();
		const dataAmount: number = this.source.count();
		/**
		 * source - contains all table data
		 * dataSet - contains data for current page
		 * selectedRowIndex - contains index for data in all data
		 *
		 * because of that, we need to count index for a specific row in page
		 * if
		 * `switchPageToSelectedRowPage` - we need to change page automatically
		 * `selectedRowIndex < dataAmount && selectedRowIndex >= 0` - index points to existing data
		 * (if index points to non-existing data and we calculate index for current page - we will get wrong selected row.
		 *  if we return index witch not points to existing data - no line will be highlighted)
		 */
		return (
			switchPageToSelectedRowPage &&
			selectedRowIndex < dataAmount &&
			selectedRowIndex >= 0
		) ?
			selectedRowIndex % perPage :
			selectedRowIndex;
	}

	private getPageToSelect(source: DataSource): number {
		const { switchPageToSelectedRowPage, selectedRowIndex, perPage, page } = this.getSelectionInfo();
		let pageToSelect: number = Math.max(1, page);
		if (switchPageToSelectedRowPage && selectedRowIndex >= 0) {
			pageToSelect = getPageForRowIndex(selectedRowIndex, perPage);
		}
		const maxPageAmount: number = Math.ceil(source.count() / perPage);
		return maxPageAmount ? Math.min(pageToSelect, maxPageAmount) : pageToSelect;
	}

	private regenerateColumns(isLeft: boolean = true)
  {
    this.columns = [];
    if(isLeft)
      this.columns.push(0);

    this.getColumns().forEach((column) => {
      this.columns.push(isLeft ? column.index + 1 : column.index);
    });

    if(!isLeft)
      this.columns.push(this.columns.length);
  }
}

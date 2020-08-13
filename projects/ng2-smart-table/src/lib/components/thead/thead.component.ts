import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, OnInit } from '@angular/core';

import { Grid } from '../../lib/grid';
import { DataSource } from '../../lib/data-source/data-source';
import { DragulaOptions, DragulaService } from 'ng2-dragula';

@Component({
	selector: '[ng2-st-thead]',
	templateUrl: './thead.component.html',
	styleUrls: ['./thead.component.scss'],
})
export class Ng2SmartTableTheadComponent implements OnInit, OnChanges, OnDestroy {

	@Input() grid: Grid;
	@Input() source: DataSource;
	@Input() isAllSelected: boolean;
	@Input() createConfirm: EventEmitter<any>;
	@Input() onOrderChanged: EventEmitter<any>;

	@Output() sort = new EventEmitter<any>();
	@Output() selectAllRows = new EventEmitter<any>();
	@Output() create = new EventEmitter<any>();
	@Output() filter = new EventEmitter<any>();

	public options: DragulaOptions = {
		revertOnSpill: true,
		removeOnSpill: true,
		moves: (el: Element | undefined) => !el.classList.contains('nonDraggable'),
		accepts: (_, __, ___, sibling) => !(this.showActionColumnRight && sibling === null),
	}
	public dragulaID: string = '';

	isHideHeader: boolean;
	isHideSubHeader: boolean;
	showActionColumnLeft: boolean;
	showActionColumnRight: boolean;

	private canRemodel: boolean = false;

	constructor(protected dragulaService: DragulaService)
	{
		this.dragulaID = this.makeID(10);
		dragulaService.createGroup(this.dragulaID, this.options);
	}

	public ngOnInit()
	{
		this.dragulaService.dropModel(this.dragulaID).subscribe((value) =>
		{
			// the change is already done.
			if (this.showActionColumnLeft && value.sibling && value.sibling.classList.contains('nonDraggable')) {
				this.canRemodel = false;
				this.dragulaService.find(this.dragulaID).drake.cancel(true);
				return;
			}

			this.canRemodel = true;
		});
	}

	ngOnDestroy() {
		this.dragulaService.destroy(this.dragulaID);
	}

	ngOnChanges() {
		this.isHideHeader = this.grid.getSetting('hideHeader');
		this.isHideSubHeader = this.grid.getSetting('hideSubHeader');

		this.showActionColumnLeft = this.grid.showActionColumn('left');
		this.showActionColumnRight = this.grid.showActionColumn('right');
	}

	onModelChange(event: Array<any>)
	{
		if(!this.canRemodel)
		{
			this.dragulaService.find(this.dragulaID).drake.cancel(true);
		}

		if (this.canRemodel)
		{
			this.grid.columns = event;

			const columns = this.grid.getColumns();

			this.grid.columns.forEach((newIndex, index) => {

				if (this.showActionColumnLeft) {
					if (columns[newIndex - 1]) {
						columns[newIndex - 1].index = index;
					}
				}

				if(this.showActionColumnRight)
				{
					if (columns[newIndex]) {
						columns[newIndex].index = index;
					}
				}
			});

			this.grid.columns.sort((a, b) => a - b);

			this.grid.getColumns().sort((a, b) => a.index - b.index);

			this.grid.getRows().forEach((row) => row.process());

			this.canRemodel = false;

			this.grid.orderChange(this.onOrderChanged);
		}
	}

	makeID(length: number): string {
		let result = '';
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
}

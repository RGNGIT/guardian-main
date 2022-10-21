import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import {
  DataGrid,
  DataGridColumn
} from '@app/shared/components/data-grid/data-grid.model';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {
  @Input() set data(data: DataGrid) {
    this.dataSource = new MatTableDataSource(data.rowData);
    this.columnDefs = data.columnDefs;
    this.displayedColumns = data.columnDefs.map(
      element => element.columnKey
    );
  }
  @ViewChild(MatSort) sort: any;

  dataSource: any = [];
  columnDefs: DataGridColumn[] = [];
  displayedColumns: string[] = [];

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}

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
  @Input() data: DataGrid = { columnDefs: [], rowData: [] };
  @ViewChild(MatSort) sort: any;

  dataSource: any = [];
  columnDefs: DataGridColumn[] = [];
  displayedColumns: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.data.rowData);
    this.columnDefs = this.data.columnDefs;
    this.displayedColumns = this.data.columnDefs.map(
      element => element.columnKey
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}

export interface DataGrid {
  columnDefs: DataGridColumn[];
  rowData: any[];
}

export interface DataGridColumn {
  columnKey: string;
  label: string;
}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { DataGrid } from '@app/shared/components/data-grid/data-grid.model';
import {SchemasService} from "@app/services/schemas.service";


@Component({
  selector: 'app-schemas-page',
  templateUrl: './schemas-page.component.html',
  styleUrls: ['./schemas-page.component.scss']
})
export class SchemasPageComponent implements OnInit {
  @ViewChild('documentColumnCellTemplate') documentColumnCellTemplate: any;
  @ViewChild('checkboxColumnHeaderTemplate') checkboxColumnHeaderTemplate: any;
  @ViewChild('checkboxColumnCellTemplate') checkboxColumnCellTemplate: any;

  constructor(private api: SchemasService) {}

  data: DataGrid = { columnDefs: [], rowData: [] };

  ngOnInit(): void {
    this.api.getAllSchemas().subscribe((response: any) => {
      console.log(response);
    });
  }

  ngAfterViewInit() {
    this.data = {
      columnDefs: [
        {
          columnKey: 'checkbox',
          label: '',
          headerTemplate: this.checkboxColumnHeaderTemplate,
          cellTemplate: this.checkboxColumnCellTemplate
        },
        { columnKey: 'type', label: 'Type' },
        { columnKey: 'entity', label: 'Entity' },
        {
          columnKey: 'document',
          label: 'Document',
          cellTemplate: this.documentColumnCellTemplate
        }
      ],
      rowData: [
        {
          type: 'Inverter',
          entity: 'INVERTER',
          document: 'View',
          checkbox: '',
          id: 333
        }
      ]
    };
  }
}

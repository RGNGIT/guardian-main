import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {NGX_MAT_DATE_FORMATS, NgxMatDateAdapter} from "@angular-material-components/datetime-picker";
import {NgxMatMomentAdapter} from "@angular-material-components/moment-adapter";
import {DATETIME_FORMATS} from "@app/shared/components/schema-form-component/schema-form.component";
import {Schema, SchemaField} from "@app/models/schema";
import {PageEvent} from "@angular/material/paginator";
import {UnitSystem} from "@app/enums/unit-system";

@Component({
  selector: 'app-schema-form-view',
  templateUrl: './schema-form-view.component.html',
  styleUrls: ['./schema-form-view.component.scss'],
  providers: [
    { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
    { provide: NGX_MAT_DATE_FORMATS, useValue: DATETIME_FORMATS }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchemaFormViewComponent implements OnInit {
  @Input('private-fields') hide!: { [x: string]: boolean };
  @Input('schema') schema: Schema | null | undefined;
  @Input('fields') schemaFields!: SchemaField[];
  @Input('delimiter-hide') delimiterHide: boolean = false;
  @Input('values') values: any;

  fields: any[] | undefined = [];
  pageSize: number = 20;

  constructor() { }


  ngOnInit(): void {
  }

  ngOnChanges() {
    this.hide = this.hide || {};
    if (this.schemaFields) {
      this.update(this.schemaFields);
      return;
    } else if (this.schema) {
      this.update(this.schema.fields);
      return;
    }
    this.update();
  }

  update(schemaFields?: SchemaField[]) {
    if (!schemaFields) {
      return;
    }

    const fields: any[] = [];
    for (let i = 0; i < schemaFields.length; i++) {
      const field = schemaFields[i];
      // @ts-ignore
      if (this.hide[field.name]) {
        continue
      }
      const item: any = {
        ...field,
        hide: false,
        isInvalidType: false
      };
      if (!field.isArray && !field.isRef) {
        item.value = !this.values
        || this.values[item.name] === null
        || this.values[item.name] === undefined
          ? ""
          : this.values[item.name];
      }
      if (!field.isArray && field.isRef) {
        item.fields = field.fields;
      }

      if (field.isArray && !field.isRef) {
        let value = [];
        if (this.values
          && this.values[item.name] !== null
          && this.values[item.name] !== undefined
        ) {
          const fieldValue = this.values[item.name];
          if (Array.isArray(fieldValue)) {
            value = fieldValue;
          }
          else {
            value = [fieldValue];
            item.isInvalidType = true;
          }
        }

        item.list = value;
      }

      if (field.isArray && field.isRef) {
        item.fields = field.fields;
        let value = [];
        if (this.values && this.values[item.name]) {
          value = this.values[item.name];
        }

        item.list = value;
      }
      fields.push(item);
    }
    this.fields = fields;
  }

  getCID(link: string): string {
    let matches = link.match(/Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}/);
    return matches
      ? matches[0]
      : "";
  }

  getItemsPage(item: any, pageEvent?: PageEvent) {
    const result = [];
    if (!pageEvent) {
      for (let i = 0; i < this.pageSize && i < item.list.length; i++) {
        result.push(item.list[i]);
      }
      return result;
    }

    const startIndex = pageEvent.pageIndex * pageEvent.pageSize;
    const endIndex = startIndex + pageEvent.pageSize;
    for (let i = startIndex; i < endIndex && i < item.list.length; i++) {
      result.push(item.list[i]);
    }
    return result;
  }

  isTime(item: SchemaField): boolean {
    return item.type === 'string' && item.format === 'time';
  }

  isDate(item: SchemaField): boolean {
    return item.type === 'string' && item.format === 'date';
  }

  isDateTime(item: SchemaField): boolean {
    return item.type === 'string' && item.format === 'date-time';
  }

  isBoolean(item: SchemaField): boolean {
    return item.type === 'boolean';
  }

  isIPFS(item: SchemaField): boolean {
    return item.pattern === '^((https):\/\/)?ipfs.io\/ipfs\/.+';
  }

  isInput(item: SchemaField): boolean {
    return (
      (
        item.type === 'string' ||
        item.type === 'number' ||
        item.type === 'integer'
      ) && (
        item.format !== 'date' &&
        item.format !== 'time' &&
        item.format !== 'date-time'
      )
    );
  }

  isPrefix(item: SchemaField): boolean {
    return item.unitSystem === UnitSystem.Prefix;
  }

  isPostfix(item: SchemaField): boolean {
    return item.unitSystem === UnitSystem.Postfix;
  }
}

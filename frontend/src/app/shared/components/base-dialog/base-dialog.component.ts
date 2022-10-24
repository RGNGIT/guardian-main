import {Component, Input} from "@angular/core";
import {Dialog} from "@angular/cdk/dialog";

@Component({
  selector: 'app-base-dialog',
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.scss']
})
export class BaseDialogComponent {

  constructor(private _dialog: Dialog) {

  }

  closeButtonHandler(): void {
    this._dialog.closeAll();
  }
}

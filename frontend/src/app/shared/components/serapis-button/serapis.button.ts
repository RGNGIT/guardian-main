import {Component, Input, OnInit} from "@angular/core";

@Component({
  selector: 'app-serapis-button',
  templateUrl: './serapis.button.html',
  styleUrls: ['./serapis.button.scss']
})
export class SerapisButton {
  @Input() title!: string;
  @Input() set type(type: 'filled' | 'empty') {
    this.currentClass = type;
    this._type = type;
  }
  @Input() set disabled(inactive: boolean) {
    this._disabled = inactive;
    this.currentClass = inactive ? 'inactivated' : this._type || 'filled';
  }
  @Input() iconTemplate: any;

  private _disabled = false;
  private _type!: string;
  currentClass: string = 'filled';

  buttonClickHandler(mouseEvent: MouseEvent) {
    if (this._disabled) {
      mouseEvent.stopPropagation();
      mouseEvent.preventDefault();
    }
  }
}

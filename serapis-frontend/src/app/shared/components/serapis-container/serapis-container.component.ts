import {Component, Input} from "@angular/core";

@Component({
  selector: 'app-serapis-container',
  templateUrl: './serapis-container.component.html',
  styleUrls: ['./serapis-container.component.scss']
})
export class SerapisContainerComponent {
  @Input() content: string = '';
  @Input() enableCopyButton: boolean = true;
}

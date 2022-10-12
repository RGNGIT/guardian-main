import {Component, Input} from "@angular/core";

@Component({
  selector: 'app-serapis-link',
  templateUrl: './serapis-link.component.html',
  styleUrls: ['./serapis-link.component.scss']
})
export class SerapisLinkComponent {
  @Input() title!: string;

}

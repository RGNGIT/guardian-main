import {Component, Input, TemplateRef} from "@angular/core";

@Component({
  selector: 'app-tooltip',
  templateUrl: './shared-tooltip.component.html',
  styleUrls: ['./shared-tooltip.component.scss']
})
export class SharedTooltipComponent {
  @Input() contentTemplate!: TemplateRef<any>;
  @Input() data?: any;
}

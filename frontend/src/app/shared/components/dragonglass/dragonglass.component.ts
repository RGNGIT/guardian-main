import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {SettingsService} from "@app/services/settings.service";

@Component({
  selector: 'app-dragonglass',
  templateUrl: './dragonglass.component.html',
  styleUrls: ['./dragonglass.component.scss']
})
export class DragonglassComponent {
  url: string;

  @Input('type') type!: string;
  @Input('params') params!: string | null;

  constructor(private settingsService: SettingsService) {
    this.url = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.settingsService.getHederaNet().subscribe((res: string) => {
      const urlPrefix = res == 'mainnet' ? 'app' : 'testnet';

      switch (this.type) {
        case 'topics':
          this.url = `https://${urlPrefix}.dragonglass.me/hedera/topics/${this.params}`;
          break;
        case 'tokens':
          this.url = `https://${urlPrefix}.dragonglass.me/hedera/tokens/${this.params}`;
          break;
        case 'accounts':
          this.url = `https://${urlPrefix}.dragonglass.me/hedera/accounts/${this.params}`;
          break;
        default:
          this.url = '';
          break;
      }
    });
  }

}

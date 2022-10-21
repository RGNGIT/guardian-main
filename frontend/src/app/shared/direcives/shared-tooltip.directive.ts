import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from "@angular/core";
import {Overlay, OverlayPositionBuilder, OverlayRef} from "@angular/cdk/overlay";
import {ComponentPortal, TemplatePortal} from "@angular/cdk/portal";
import {SharedTooltipComponent} from "@app/shared/components/shared-tooltip/shared-tooltip.component";

@Directive( {
  selector: '[appTooltip]'
} )
export class SharedTooltipDirective implements OnInit, OnDestroy {
  @Input() showToolTip = true;
  @Input( 'appTooltip' ) contentTemplate!: TemplateRef<any>;
  @Input() data?: any;
  @Input() enableTooltipComponent = true;
  private _overlayRef!: OverlayRef;

  constructor( private _overlay: Overlay,
               private _overlayPositionBuilder: OverlayPositionBuilder,
               private _elementRef: ElementRef,
               private _viewContainerRef: ViewContainerRef) {
  }

  ngOnInit(): void {
    if ( !this.showToolTip ) {
      return;
    }

    const positionStrategy = this._overlayPositionBuilder
      .flexibleConnectedTo( this._elementRef )
      .withPositions( [{
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -10,
      }] );

    this._overlayRef = this._overlay.create( { positionStrategy } );
  }

  ngOnDestroy(): void {
    this.closeToolTip();
  }

  @HostListener('mouseenter')
  private show(): void {
    if (this._overlayRef && !this._overlayRef.hasAttached()) {
      if (this.enableTooltipComponent) {
        const tooltipRef: ComponentRef<SharedTooltipComponent> = this._overlayRef.attach(new ComponentPortal(SharedTooltipComponent));
        tooltipRef.instance.data = this.data;
        tooltipRef.instance.contentTemplate = this.contentTemplate;
      } else {
        this._overlayRef.attach(new TemplatePortal(this.contentTemplate, this._viewContainerRef));
      }
    }
  }

  @HostListener('mouseleave')
  public hide(): void {
    this.closeToolTip();
  }

  private closeToolTip(): void {
    if (this._overlayRef) {
      this._overlayRef.detach();
    }
  }
}

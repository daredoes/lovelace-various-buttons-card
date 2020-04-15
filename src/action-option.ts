import { LitElement, html, property, TemplateResult, customElement } from 'lit-element';
import { OptionConfig } from './option-config';

@customElement('action-option')
export class ActionOption extends LitElement {
  @property()
  public name!: string;
  @property() public icon: string | undefined;
  @property() public secondary: string | undefined;
  @property()
  public show!: boolean;
  @property() public options: Array<OptionConfig> | undefined;
  @property()
  public toggleCallback!: Function;
  @property()
  public toggle!: boolean;

  protected render(): TemplateResult | void {
    return html`
      <div class="option" @click=${this._toggleAction}>
        <div class="row">
          <ha-icon .icon=${this.icon ? this.icon : 'mdi:gesture-tap'}></ha-icon>
          <div class="title">${name}</div>
        </div>
        <div class="secondary">${this.secondary}</div>
      </div>
      ${this.show
        ? html`
            <div class="values">
              ${this.options
                ? this.options.map(this.renderChild)
                : html`
                    <slot name="children"></slot>
                  `}
            </div>
          `
        : ''}
    `;
  }

  private renderChild = (option: OptionConfig): TemplateResult => {
    return option.toTemplateResult(this._toggleThis);
  };

  private _toggleThis = (): void => {
    this.options = this.options
      ? this.options.map(function(option) {
          option.show = false;
          return option;
        })
      : undefined;
    this.toggle = !this.toggle;
  };

  private _toggleAction = (): void => {
    this.show = !this.show;
    this.toggleCallback();
  };
}

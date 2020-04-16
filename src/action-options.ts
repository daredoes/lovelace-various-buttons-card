import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';

import { OptionConfig } from './option-config';

@customElement('action-options')
class Options extends LitElement {
  @property() public options!: Array<OptionConfig>;
  @property() private _toggle?: boolean;

  private _toggleThing(): void {
    this._toggle = !this._toggle;
  }

  protected render(): TemplateResult | void {
    const toggle = this._toggleThing;
    return html`
      ${this.options.map(function(option) {
        return option.toTemplateResult(toggle);
      })}
    `;
  }
}

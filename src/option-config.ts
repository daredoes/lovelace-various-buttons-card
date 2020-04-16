import { html, TemplateResult } from 'lit-element';
import './action-option';

export class OptionConfig {
  name: string;
  icon: string | undefined;
  secondary: string | undefined;
  show: boolean;
  options: Array<OptionConfig> | undefined;
  children: TemplateResult | undefined;

  constructor(
    name: string,
    icon: string | undefined,
    secondary: string | undefined,
    show: boolean,
    options: Array<OptionConfig> | undefined,
    children: TemplateResult | undefined,
  ) {
    this.name = name;
    this.secondary = secondary;
    this.icon = icon;
    this.show = show;
    this.options = options;
    this.children = children;
  }

  public toTemplateResult = (toggleCallback: Function): TemplateResult => {
    const result = html`
      <action-option
        .show=${this.show}
        .name=${this.name}
        .icon=${this.icon}
        .options=${this.options}
        .secondary=${this.secondary}
        .toggle=${false}
        .toggleCallback=${toggleCallback}
      >
        <div slot="children">
          ${this.children}
        </div>
      </action-option>
    `;
    return result;
  };
}

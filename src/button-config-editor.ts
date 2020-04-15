import { LitElement, html, customElement, property, TemplateResult, css, CSSResult } from 'lit-element';
import { HomeAssistant, ActionConfig } from 'custom-card-helpers';

import { ButtonConfig } from './types';

import './action-config-editor';

export interface ButtonEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: ButtonConfig): void;
}

@customElement('button-config-editor')
export class ButtonConfigEditor extends LitElement implements ButtonEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: ButtonConfig;
  @property() private _update!: Function;

  public setConfig = (config: ButtonConfig): void => {
    this._config = config;
    this._update(this._config);
  };

  private updateActionConfigFactory = (): Function => {
    const update = this.setConfig;
    const config = this._config;
    const func = function(kind: string, actionConfig: ActionConfig): void {
      const updatedConfig = Object.assign({}, config);
      updatedConfig[kind] = actionConfig;
      update(updatedConfig);
    };
    return func;
  };

  protected render(): TemplateResult | void {
    return html`
      <div class="card-config">
        <action-config-editor
          ._config=${this._config}
          .hass=${this.hass}
          ._update=${this.updateActionConfigFactory()}
        ></action-config-editor>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
      }
      ha-switch {
        padding-bottom: 8px;
      }
    `;
  }
}

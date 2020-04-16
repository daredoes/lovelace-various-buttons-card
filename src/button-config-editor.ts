import { LitElement, html, customElement, property, TemplateResult, css, CSSResult } from 'lit-element';
import { HomeAssistant, ActionConfig } from 'custom-card-helpers';

import { ButtonConfig } from './types';
import { OptionConfig } from './option-config';

import './action-config-editor';
import './action-options';

export interface ButtonEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: ButtonConfig): void;
}

@customElement('button-config-editor')
export class ButtonConfigEditor extends LitElement implements ButtonEditor {
  @property() public hass?: HomeAssistant;
  @property() public index!: number;
  @property() public isFirst?: boolean;
  @property() private _config?: ButtonConfig;
  @property() private _update!: Function;
  @property() private toggle!: boolean;

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

  private _valueChanged = (ev): void => {
    //TODO: FIX INFINITE LOOP DUE TO CHECKED BOX
    if (this._config) {
      const target = ev.target;
      let config = Object.assign({}, this._config);
      if (target.configValue) {
        if (target.value === '') {
          delete config[target.configValue];
        } else if (target.configValue.indexOf('.') !== -1) {
          const values = target.configValue.split('.');
          const result = values.reduceRight(
            (all, item) => ({ [item]: all }),
            target.checked !== undefined ? target.checked : target.value,
          );
          config = {
            ...config,
            ...result,
          };
        } else {
          config = {
            ...config,
            [target.configValue]: target.checked !== undefined ? target.checked : target.value,
          };
        }
        if (JSON.stringify(config) !== JSON.stringify(this._config)) {
          this.setConfig(config);
        }
      }
    }
  };
  private createOptions = (): Array<OptionConfig> => {
    if (this._config && this.hass) {
      const actions = html`
        <action-config-editor
          ._config=${this._config}
          .hass=${this.hass}
          ._update=${this.updateActionConfigFactory()}
        ></action-config-editor>
      `;
      const appearance = html`
        <action-options .options=${this.createAppearanceOptions()}></action-options>
      `;
      const update = this._update;
      const makeClickFunction = function(): Function {
        const func = function(): void {
          update();
        };
        return func;
      };
      const deleteElement = html`
        <mwc-button style="width: 100%" @click=${makeClickFunction()} label="Delete" outline raised></mwc-button>
      `;
      const newButton = Object.keys(this._config).length === 0;
      return [
        new OptionConfig(
          this._config.name || newButton ? 'New Button' : `Button ${this.index + 1}`,
          this._config.icon || 'mdi:radiobox-marked',
          `Edit actions and appearance ${newButton ? 'to save' : ''}`,
          false,
          undefined,
          html`
            ${actions} ${appearance} ${deleteElement}
          `,
        ),
      ];
    }
    return [];
  };

  private createAppearanceOptions = (): Array<OptionConfig> => {
    if (this._config && this.hass) {
      const spacerElement = this._config.spacer
        ? html`
            <paper-checkbox .configValue=${'spacer'} checked @change=${this._valueChanged}>Spacer</paper-checkbox>
          `
        : html`
            <paper-checkbox .configValue=${'spacer'} @change=${this._valueChanged}>Spacer</paper-checkbox>
          `;
      return [
        new OptionConfig(
          'Appearance',
          'mdi:palette',
          'Customize the name, icon, etc',
          false,
          undefined,
          html`
            <div class="values">
              <paper-input
                label="Name (Optional)"
                .value=${this._config.name}
                .configValue=${'name'}
                @value-changed=${this._valueChanged}
              ></paper-input>
              <paper-input
                label="Icon"
                .value=${this._config.icon}
                .configValue=${'icon'}
                @value-changed=${this._valueChanged}
              ></paper-input>
              ${spacerElement}
            </div>
          `,
        ),
      ];
    }
    return [];
  };

  protected render(): TemplateResult | void {
    if (!this._config) {
      return html``;
    }
    const options = this.createOptions();
    const update = this._update;
    const config = this._config;
    const makeClickFunction = function(moveUp: boolean): Function {
      const func = function(): void {
        update(config, moveUp);
      };
      return func;
    };
    const upArrow =
      this.isFirst === true
        ? html`
            <mwc-button disabled label="Up"></mwc-button>
          `
        : html`
            <mwc-button @click=${makeClickFunction(true)} label="Up"></mwc-button>
          `;
    const downArrow =
      this.isFirst === false
        ? html`
            <mwc-button disabled label="Down"></mwc-button>
          `
        : html`
            <mwc-button @click=${makeClickFunction(false)} label="Down"></mwc-button>
          `;
    const isNewButton = Object.keys(this._config).length === 0;

    return html`
      <div class="card-config">
        <div class="action-with-buttons">
          <action-options .options=${options}></action-options>
          ${!isNewButton
            ? html`
                ${upArrow} ${downArrow}
              `
            : ''}
        </div>
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
      .paper-item:hover {
        cursor: text;
      }

      .action-with-buttons {
        display: flex;
        justify-content: flex-end;
      }

      .action-with-buttons > *:first-child {
        flex-grow: 1;
      }
      button.mdc-button {
        height: 100%;
      }
    `;
  }
}

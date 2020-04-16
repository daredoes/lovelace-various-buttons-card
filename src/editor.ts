import { LitElement, html, customElement, property, TemplateResult, CSSResult, css } from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';

import { VariousButtonsCardConfig, ButtonConfig } from './types';
import './button-config-editor';

const options = {
  buttons: {
    icon: 'tune',
    name: 'Buttons',
    secondary: 'Buttons used for this card to function',
    show: true,
  },
  actions: {
    icon: 'gesture-tap-hold',
    name: 'Actions',
    secondary: 'Perform actions based on tapping/clicking',
    show: false,
    options: {
      tap: {
        icon: 'gesture-tap',
        name: 'Tap',
        secondary: 'Set the action to perform on tap',
        show: false,
      },
      hold: {
        icon: 'gesture-tap-hold',
        name: 'Hold',
        secondary: 'Set the action to perform on hold',
        show: false,
      },
      double_tap: {
        icon: 'gesture-double-tap',
        name: 'Double Tap',
        secondary: 'Set the action to perform on double tap',
        show: false,
      },
    },
  },
  appearance: {
    icon: 'palette',
    name: 'Appearance',
    secondary: 'Customize the name, icon, etc',
    show: false,
  },
};

@customElement('various-buttons-card-editor')
export class VariousButtonsCardConfigEditor extends LitElement implements LovelaceCardEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: VariousButtonsCardConfig;
  @property() private _toggle?: boolean;

  private updateConfig = (config: VariousButtonsCardConfig): void => {
    fireEvent(this, 'config-changed', { config: config });
  };

  public updateButtonConfigFactory = (index: number): Function => {
    const thisConfig = this._config;
    const update = this.updateConfig;
    const func = function(buttonConfig?: ButtonConfig, moveUp?: boolean): void {
      const config = Object.assign({}, thisConfig);
      const buttons = config.buttons ? config.buttons.slice(0) : [];
      if (buttons && buttons.length > index) {
        if (!buttonConfig) {
          buttons.splice(index, 1);
        } else if (moveUp !== undefined) {
          const newIndex = index + (moveUp ? -1 : 1);
          buttons[index] = buttons[newIndex];
          buttons[newIndex] = buttonConfig;
        } else {
          buttons[index] = buttonConfig;
        }
      } else if (buttons && buttonConfig) {
        buttons.push(buttonConfig);
      }
      config.buttons = buttons;
      update(config);
    };
    return func;
  };

  public setConfig(config: VariousButtonsCardConfig): void {
    this._config = config;
  }

  get _name(): string {
    if (this._config) {
      return this._config.name || '';
    }

    return '';
  }

  get _show_warning(): boolean {
    if (this._config) {
      return this._config.show_warning || false;
    }

    return false;
  }

  get _columns(): number {
    if (this._config) {
      return this._config.columns || 1;
    }

    return 1;
  }

  get _buttons(): Array<ButtonConfig> {
    if (this._config) {
      return this._config.buttons || new Array<ButtonConfig>();
    }

    return new Array<ButtonConfig>();
  }

  private renderButtonElements = (): TemplateResult => {
    const buttons = this._buttons;
    const update = this.updateButtonConfigFactory;
    const hass = this.hass;
    const numberOfButtons = buttons.length;
    const buttonsHTML = buttons.map(function(button, index) {
      return html`
        <button-config-editor
          ._config=${button}
          .hass=${hass}
          .index=${index}
          .isFirst=${index === 0 ? true : index === numberOfButtons - 1 ? false : undefined}
          ._update=${update(index)}
        ></button-config-editor>
      `;
    });
    return html`
      <div class="values">
        ${buttonsHTML}
        <button-config-editor
          ._config=${{}}
          .index=${buttons.length}
          ._update=${update(numberOfButtons)}
          .hass=${hass}
          .isFirst=${undefined}
        ></button-config-editor>
      </div>
    `;
  };

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    // You can restrict on domain type
    const buttons = this.renderButtonElements();

    return html`
      <div class="card-config">
        <div class="option" @click=${this._toggleOption} .option=${'buttons'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.buttons.icon}`}></ha-icon>
            <div class="title">${options.buttons.name}</div>
          </div>
          <div class="secondary">${options.buttons.secondary}</div>
        </div>
        ${options.buttons.show
          ? html`
              <div class="values">
                ${buttons}
              </div>
            `
          : ''}
        <div class="option" @click=${this._toggleOption} .option=${'appearance'}>
          <div class="row">
            <ha-icon .icon=${`mdi:${options.appearance.icon}`}></ha-icon>
            <div class="title">${options.appearance.name}</div>
          </div>
          <div class="secondary">${options.appearance.secondary}</div>
        </div>
        ${options.appearance.show
          ? html`
              <div class="values">
                <paper-input
                  label="Name (Optional)"
                  .value=${this._name}
                  .configValue=${'name'}
                  @value-changed=${this._valueChanged}
                ></paper-input>
                <paper-input
                  label="Columns"
                  min="1"
                  type="number"
                  .value=${this._columns}
                  .configValue=${'columns'}
                  @value-changed=${this._valueChanged}
                ></paper-input>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private _toggleAction(ev): void {
    this._toggleThing(ev, options.actions.options);
  }

  private _toggleOption(ev): void {
    this._toggleThing(ev, options);
  }

  private _toggleThing(ev, optionList): void {
    const show = !optionList[ev.target.option].show;
    for (const [key] of Object.entries(optionList)) {
      optionList[key].show = false;
    }
    optionList[ev.target.option].show = show;
    this._toggle = !this._toggle;
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    let config = Object.assign({}, this._config);
    if (target.configValue) {
      if (target.value === '') {
        delete config[target.configValue];
      } else {
        config = {
          ...config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }

    fireEvent(this, 'config-changed', { config: config });
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

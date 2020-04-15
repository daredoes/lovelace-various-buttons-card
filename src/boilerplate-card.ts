import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers';

import './editor';

import { BoilerplateCardConfig, ButtonConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  BOILERPLATE-CARD \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// TODO Name your custom element
@customElement('boilerplate-card')
export class BoilerplateCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('boilerplate-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return { name: 'test', haptic: true, type: 'custom:boilerplate-card', columns: 3 };
  }

  // TODO Add any properities that should cause your element to re-render here
  @property() public hass?: HomeAssistant;
  @property() private _config?: BoilerplateCardConfig;

  public setConfig(config: BoilerplateCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    getLovelace().setEditMode(true);

    this._config = {
      ...config,
    };
  }

  private renderButtons(): TemplateResult | void {
    if (!this._config || !this._config.buttons) {
      return html``;
    }
    const columns = this._config.columns || 1;
    const elements = new Array<TemplateResult>();
    const factory = this._handleActionFactory;
    const width = 100 / columns;
    for (let i = 0; i < this._config.buttons.length; i += columns) {
      const next = i + columns;
      const buttons = this._config.buttons.slice(i, next);
      elements.push(html`
        <div class="row">
          ${buttons.map(function(button) {
            if (button.spacer) {
              return html`
                <ha-icon style=${`width: ${width}%`} .icon=${button.icon || 'mdi:gesture-tap'} class="spacer"></ha-icon>
              `;
            }
            const handleAction = factory(button);
            return html`
              <ha-icon
                style=${`width: ${width}%`}
                .icon=${button.icon || 'mdi:gesture-tap'}
                @action=${handleAction}
                .actionHandler=${actionHandler({
                  hasHold: hasAction(button.hold_action),
                  hasDoubleTap: hasAction(button.double_tap_action),
                  repeat: button.hold_action ? button.hold_action.repeat : undefined,
                })}
              ></ha-icon>
            `;
          })}
        </div>
      `);
    }
    return html`
      ${elements}
    `;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this._config.show_warning) {
      return html`
        <ha-card>
          <div class="warning">${localize('common.show_warning')}</div>
        </ha-card>
      `;
    }

    return html`
      <ha-card .header=${this._config.name} tabindex="0" aria-label=${this._config.name || ''}>
        ${this.renderButtons()}
      </ha-card>
    `;
  }

  private _handleActionFactory = (button: ButtonConfig): Function => {
    const hass = this.hass;
    const action = function _handleAction(ev: ActionHandlerEvent): void {
      if (hass && ev.detail.action && ev.target instanceof HTMLElement) {
        handleAction(ev.target, hass, button, ev.detail.action);
      }
    };
    return action;
  };

  static get styles(): CSSResult {
    return css`
      .warning {
        display: block;
        color: black;
        background-color: #fce588;
        padding: 8px;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: start;
        flex-wrap: wrap;
      }
      .row > ha-icon {
        padding: 1rem 0;
        z-index: 100;
      }

      .row > ha-icon:not(.spacer) {
        cursor: pointer;
      }

      ha-icon.spacer {
        color: rgba(0, 0, 0, 0);
      }
    `;
  }
}

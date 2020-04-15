import { LitElement, html, customElement, property, TemplateResult, css, CSSResult } from 'lit-element';
import { HomeAssistant, ActionConfig } from 'custom-card-helpers';

import { OptionConfig } from './option-config';
import { ButtonConfig } from './types';
import { HassEntity } from 'home-assistant-js-websocket';

export interface ActionEditor extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: ButtonConfig): void;
}

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

@customElement('action-config-editor')
export class ActionConfigEditor extends LitElement implements ActionEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: ButtonConfig;
  @property() private _update!: Function;

  private actions: Array<string> = ['call-service', 'navigate', 'more-info', 'url', 'none'];

  private createActionOption = (
    kind: string,
    name: string,
    icon: string | undefined,
    secondary: string | undefined,
  ): OptionConfig => {
    return new OptionConfig(
      name,
      icon,
      secondary,
      false,
      undefined,
      this._config ? this.renderActionElement(kind, this._config[kind]) : undefined,
    );
  };

  private createOptions = (): Array<OptionConfig> => {
    if (this._config) {
      const create = this.createActionOption;
      return [
        new OptionConfig(
          'Actions',
          'mdi:gesture-tap-hold',
          'Perform actions based on tapping/clicking',
          false,
          [
            create('tap_action', 'Tap', 'mdi:gesture-tap', 'Set the action to perform on tap'),
            create('hold_action', 'Hold', 'mdi:gesture-tap-hold', 'Set the action to perform on hold'),
            create(
              'double_tap_action',
              'Double Tap',
              'mdi:gesture-double-tap',
              'Set the action to perform on double tap',
            ),
          ],
          undefined,
        ),
      ];
    }
    return [];
  };

  public renderActionElement = (kind: string, actionConfig?: ActionConfig): TemplateResult => {
    const valueChanged = this._valueChangedFactory(kind, actionConfig);
    const config = actionConfig || {};
    const hass = this.hass;
    const makeTextInput = function(label, configValue): TemplateResult {
      return html`
        <paper-input
          label=${label}
          .value=${config[configValue]}
          .configValue=${configValue}
          @value-changed=${valueChanged}
        >
        </paper-input>
      `;
    };
    const makeDropdownInput = function(
      label: string,
      configValue: string,
      elements: Array<any>,
      selectedElement?,
      renderFunction?,
      selectedKeys?,
    ): TemplateResult {
      return html`
        <paper-dropdown-menu label=${label} @value-changed=${valueChanged} .configValue=${configValue}>
          <paper-listbox
            slot="dropdown-content"
            .selected=${selectedKeys ? selectedKeys.indexOf(selectedElement) : elements.indexOf(selectedElement)}
          >
            ${renderFunction
              ? elements.map(renderFunction)
              : elements.map(element => {
                  return html`
                    <paper-item>${element}</paper-item>
                  `;
                })}
          </paper-listbox>
        </paper-dropdown-menu>
      `;
    };
    const actions = makeDropdownInput('Action', 'action', this.actions, actionConfig ? actionConfig.action : 'none');

    const services = hass ? hass.services : {};
    const renderServices = function(service): TemplateResult {
      const currentService = services[service];
      const serviceElements = Object.keys(currentService).map(function(serviceName) {
        return html`
          <paper-item>
            ${service}.${serviceName}
          </paper-item>
        `;
      });
      return html`
        ${serviceElements}
      `;
    };
    const serviceKeys = Object.keys(services);
    const serviceSelectedKeys = serviceKeys
      .map(function(service) {
        const currentService = services[service];
        return Object.keys(currentService).map(function(serviceName) {
          return `${service}.${serviceName}`;
        });
      })
      .reduce((acc, val) => acc.concat(val), []);
    const servicesElement = makeDropdownInput(
      'Service',
      'service',
      serviceKeys,
      config['service'],
      renderServices,
      serviceSelectedKeys,
    );

    const entities = Object.keys(hass ? hass.states : {});
    const entitiesElement = makeDropdownInput('Entity', 'entity', entities, config['entity']);
    const serviceEntitiesElement = makeDropdownInput(
      'Entity',
      'service_data.entity_id',
      entities,
      config['service_data'] ? config['service_data']['entity_id'] : undefined,
    );

    const serviceElement = html`
      ${servicesElement} ${serviceEntitiesElement}
    `;

    const urlPathElement = makeTextInput('URL Path', 'url_path');
    const navigateElement = makeTextInput('Navigation Path', 'navigation_path');

    const elements = {
      url: urlPathElement,
      navigate: navigateElement,
      'call-service': serviceElement,
      'more-info': entitiesElement,
    };
    return html`
      <div class="values">
        ${actions} ${elements[config['action']] || ''}
      </div>
    `;
  };

  private _valueChangedFactory = (kind: string, actionConfig?: ActionConfig): Function => {
    const update = this._update;
    const func = function(ev): void {
      const target = ev.target;
      let config = Object.assign({}, actionConfig);
      if (target.configValue) {
        if (target.configValue === 'action' && target.value === 'none') {
          config = { action: 'none' };
        } else if (target.value === '') {
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
      }

      update(kind, config);
    };
    return func;
  };

  public setConfig(config: ButtonConfig): void {
    this._config = config;
  }

  protected render(): TemplateResult | void {
    return html`
      <div class="card-config">
        <action-options .options=${this.createOptions()} .toggle=${false}></action-options>
      </div>
    `;
  }

  get _url_path(): string | undefined {
    if (this._config) {
      return this._config['url_path'] || undefined;
    }
    return undefined;
  }

  get _navigation_path(): string | undefined {
    if (this._config) {
      return this._config['navigation_path'] || undefined;
    }
    return undefined;
  }

  get _entity(): string | undefined {
    if (this._config) {
      return this._config['entity'] || undefined;
    }
    return undefined;
  }

  get _entity_id(): string | undefined {
    if (this._config) {
      return this._config['service']['service_data']['entity_id'] || undefined;
    }
    return undefined;
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

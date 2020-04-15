import { ActionConfig } from 'custom-card-helpers';

// TODO Add your configuration elements here for type-checking
export interface ButtonConfig {
  icon?: string;
  name?: string;
  color?: string;
  spacer: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface BoilerplateCardConfig {
  type: string;
  name?: string;
  columns?: number;
  haptic: boolean;
  show_warning?: boolean;
  buttons?: Array<ButtonConfig>;
}

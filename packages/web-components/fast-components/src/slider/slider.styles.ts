import { css } from "@microsoft/fast-element";
import { disabledCursor, display } from "../styles";
import { focusVisible } from "../styles/focus";
import { SystemColors } from "../styles/system-colors";
import { heightNumber } from "../styles/size";
import {
    neutralForegroundActiveBehavior,
    neutralForegroundHoverBehavior,
    neutralForegroundRestBehavior,
    neutralOutlineHoverBehavior,
    neutralOutlineRestBehavior,
} from "../styles/recipes";

export const SliderStyles = css`
    :host([hidden]) {
        display: none;
    }

    ${display("inline-grid")} :host {
        --thumb-size: calc(${heightNumber} * 0.5);
        --thumb-translate: calc(var(--thumb-size) * 0.5);
        --track-overhang: calc((var(--design-unit) / 2) * -1);
        align-items: center;
        outline: none;
        width: 100%;
        margin: calc(var(--design-unit) * 1px) 0;
        user-select: none;
        box-sizing: border-box;
        border-radius: calc(var(--corner-radius) * 1px);
        outline: none;
        cursor: pointer;
    }
    :host(.horizontal) .positioning-region {
        position: relative;
        margin: 0 8px;
        display: grid;
        grid-template-rows: calc(var(--thumb-size) * 1px) 1fr;
    }
    :host(.vertical) .positioning-region {
        position: relative;
        margin: 0 8px;
        display: grid;
        height: 100%;
        grid-template-columns: calc(var(--thumb-size) * 1px) 1fr;
    }
    .thumb-container {
        position: absolute;
        height: calc(var(--thumb-size) * 1px);
        width: calc(var(--thumb-size) * 1px);
        transition: "all 0.2s ease";
    }
    .thumb-cursor {
        border: none;
        width: calc(var(--thumb-size) * 1px);
        height: calc(var(--thumb-size) * 1px);
        background: var(--neutral-foreground-rest);
        border-radius: 50%;
    }
    .thumb-cursor:hover {
        background: var(--neutral-foreground-hover);
        border-color: var(--neutral-outline-hover);
    }
    .thumb-cursor:active {
        background: var(--neutral-foreground-active);
    }
    :host(.horizontal) .thumb-container {
        transform: translateX(calc(var(--thumb-translate) * 1px));
    }
    :host(.vertical) .thumb-container {
        transform: translateY(calc(var(--thumb-translate) * 1px));
    }
    :host(.horizontal) {
        min-width: calc(var(--design-unit) * 60px);
    }
    :host(.horizontal) .track {
        right: calc(var(--track-overhang) * 1px);
        left: calc(var(--track-overhang) * 1px);
        align-self: start;
        margin-top: 6px;
        height: 4px;
    }
    :host(.vertical) .track {
        top: calc(var(--track-overhang) * 1px);
        bottom: calc(var(--track-overhang) * 1px);
        justify-self: start;
        margin-left: 6px;
        width: 4px;
        height: 100%;
    }
    .track {
        background: var(--neutral-outline-rest);
        position: absolute;
    }
    :host(.vertical) {
        height: 100%;
        min-height: calc(var(--design-unit) * 60px);
        min-width: calc(var(--design-unit) * 20px);
    }
    :host(.disabled) .label,
    :host(.readonly) .label,
    :host(.readonly) .slider,
    :host(.disabled) .slider {
        cursor: ${disabledCursor};
    }
    :host(.disabled) {
        opacity: var(--disabled-opacity);
    }

    @media (forced-colors: active) {
        .thumb-cursor {
            forced-color-adjust: none;
            border-color: ${SystemColors.FieldText};
            background: ${SystemColors.FieldText};
        }

        .thumb-cursor:hover,
        .thumb-cursor:active {
            background: ${SystemColors.Highlight};
        }

        .track {
            forced-color-adjust: none;
            background: ${SystemColors.FieldText};
        }
        
        :host(:${focusVisible}) .thumb-cursor {
            border-color: ${SystemColors.Highlight};
        }

        :host(.disabled) {
            opacity: 1;
            cursor: ${disabledCursor};
        }

        :host(.disabled) .slider,
        :host(.disabled) .track,
        :host(.disabled) .thumb-cursor {
            forced-color-adjust: none;
            background: ${SystemColors.GrayText};
        }
    }
`.withBehaviors(
    neutralForegroundActiveBehavior,
    neutralForegroundHoverBehavior,
    neutralForegroundRestBehavior,
    neutralOutlineHoverBehavior,
    neutralOutlineRestBehavior
);

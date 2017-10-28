import { elementErrorMessages } from '../element-wrapper/element-wrapper.consts';
import { IElementConfig } from './element.config.interfaces';
import { GroupUiElement, GROUP_TYPES } from './group-ui-element';
import { IFormConfig, IGroupElementConfig, ILayoutModel } from './groups.config.interfaces';
import { Dictionary, IConfigurationChangeDescription } from './shared.interfaces';
import { UiElement } from './ui-element';
import { utils } from './utils';

export abstract class LayoutElement {
    // name: string; // unique identifier
    // elements: IElementConfig[];
    // groupElements: IGroupElementConfig[];
    // layout: {
    //     group?: string;
    //     lines: string[][];
    // };
    // linkDefinitions?: IConfigurationChangeDescription[];

    visibleLayout;

    private _uiGroupElementsMap: Dictionary<GroupUiElement> = {};
    private _uiElementsMap: Dictionary<UiElement> = {};
    private _linkDefinitions: Dictionary<IConfigurationChangeDescription> = {};
    private _layoutModel: ILayoutModel;

    // private _jsonModel: IFormConfig = null;

    constructor(jsonModel: IFormConfig) {
        this.validate(jsonModel);
        this._layoutModel = jsonModel.layout;
        this._linkDefinitions = jsonModel.linkDefinitions || {};

        this.compileUiElements(jsonModel.elements);
        this.compileUiGroupElements(jsonModel.groupElements);
        this.compileRemainedLinkElements();
        // TODO Consider letting angular to draw the layout and used the main control group for changes
        /** TODO flow valueChanges$ -> check links for element recompilation (recompile only if this is needed)
         *  TODO                    -> create a new layout
         *  TODO                    -> do reference checks for the new Layout
         *  TODO                    -> if references have changed rerender the changed nodes
         *  TODO consequences       -> OnPush must depend on inputs which are in layout references and rerender the dom accordingly
         */

        // TODO add ngControls to elements
        // TODO add rx BS which supports hot value changes for the main element group
        // TODO find a way to keep the ngControls touched/disabled state
        // TODO The ngControls must support hot reloading of validation without triggering changes
        // TODO Create visible layout -> the layout should not reRender unless this is needed
        this.drawLayout();
    }

    private validate(jsonModel: IFormConfig) {
        if (!jsonModel) {
            utils.throwError(elementErrorMessages.noFormConfig, this);
        }

        if (!utils.isArray(jsonModel.layout)) {
            utils.throwError(elementErrorMessages.invalidLayout, this);
        }
    }

    private compileUiElements(elements: IElementConfig[]) {
        if (!utils.isArray(elements)) {
            return;
        }

        for (const element of elements) {
            let newElement: Dictionary<any> = {...element};
            if (this._linkDefinitions.hasOwnProperty(element.name) &&
                this._linkDefinitions[element.name].defaultConfig) {
                newElement = {...this._linkDefinitions[element.name].defaultConfig};
            }

            const uiElement = new UiElement(newElement);
            this._uiElementsMap[uiElement.name] = uiElement;
        }
    }

    private compileUiGroupElements(groupElements: IGroupElementConfig[]) {
        if (!utils.isArray(groupElements)) {
            return;
        }

        for (const group of groupElements) {
            let newGroupDef: Dictionary<any> = group;
            if (this._linkDefinitions.hasOwnProperty(group.name) &&
                this._linkDefinitions[group.name].defaultConfig) {
                // Combine defaults with element def
                newGroupDef = {...this._linkDefinitions[group.name].defaultConfig as any};
            }

            const groupUiElement = new GroupUiElement(newGroupDef);
            this._uiGroupElementsMap[groupUiElement.name] = groupUiElement;
        }
    }

    private compileRemainedLinkElements() {
        // The links without default config can be evaluated only when the form value is applyer
        for (const key in this._linkDefinitions) {
            if (this._uiGroupElementsMap[key] ||
                this._uiElementsMap[key] ||
                !this._linkDefinitions[key].defaultConfig) {
                continue;
            }

            // we compile the remaining elements and add them to the cache map
            const elementData = {
                ...this._linkDefinitions[key].defaultConfig,
                name: key
            };
            switch (this._linkDefinitions[key].defaultConfig.type) {
                case GROUP_TYPES.matCard:
                case GROUP_TYPES.ngtCard:
                case GROUP_TYPES.matExpansionPane:
                case GROUP_TYPES.simpleElement:
                    const groupElement = new GroupUiElement(elementData);
                    this._uiGroupElementsMap[key] = groupElement;
                    break;
                default:
                    const element = new UiElement(elementData);
                    this._uiElementsMap[key] = element;
                    break;
            }
        }
    }

    private drawLayout() {
        const inMemoryLayout = [];
        // TODO
    }

    // private validateLinkWithoutDefault(linkDefinition: IConfigurationChangeDescription) {
    //     if (!linkDefinition.configChangesMap) {
    //         utils.throwError(elementErrorMessages.invalidLink, this);
    //     }
    // }
}

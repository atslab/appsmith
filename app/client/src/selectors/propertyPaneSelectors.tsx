import { createSelector } from "reselect";
import { AppState } from "reducers";
import { PropertyPaneReduxState } from "reducers/uiReducers/propertyPaneReducer";
import { CanvasWidgetsReduxState } from "reducers/entityReducers/canvasWidgetsReducer";
import { WidgetProps } from "widgets/BaseWidget";
import { DataTree, DataTreeWidget } from "entities/DataTree/dataTreeFactory";
import _ from "lodash";
import { evaluateDataTreeWithoutFunctions } from "selectors/dataTreeSelectors";
import * as log from "loglevel";

const getPropertyPaneState = (state: AppState): PropertyPaneReduxState =>
  state.ui.propertyPane;

const getCanvasWidgets = (state: AppState): CanvasWidgetsReduxState =>
  state.entities.canvasWidgets;

export const getCurrentWidgetId = createSelector(
  getPropertyPaneState,
  (propertyPane: PropertyPaneReduxState) => propertyPane.widgetId,
);

export const getCurrentWidgetProperties = createSelector(
  getCanvasWidgets,
  getPropertyPaneState,
  (
    widgets: CanvasWidgetsReduxState,
    pane: PropertyPaneReduxState,
  ): WidgetProps | undefined => {
    return pane.widgetId && widgets ? widgets[pane.widgetId] : undefined;
  },
);

export const getWidgetPropsForPropertyPane = createSelector(
  getCurrentWidgetProperties,
  evaluateDataTreeWithoutFunctions,
  (
    widget: WidgetProps | undefined,
    evaluatedTree: DataTree,
  ): WidgetProps | undefined => {
    log.debug("Evaluating data tree to get property pane validations");
    if (!widget) return undefined;
    const evaluatedWidget = _.find(evaluatedTree, {
      widgetId: widget.widgetId,
    }) as DataTreeWidget;
    const widgetProperties = { ...widget };
    if (evaluatedWidget) {
      if (evaluatedWidget.evaluatedValues) {
        widgetProperties.evaluatedValues = {
          ...evaluatedWidget.evaluatedValues,
        };
      }
      if (evaluatedWidget.invalidProps) {
        const { invalidProps, validationMessages } = evaluatedWidget;
        widgetProperties.invalidProps = invalidProps;
        widgetProperties.validationMessages = validationMessages;
      }
    }
    return widgetProperties;
  },
);

export const getIsPropertyPaneVisible = createSelector(
  getPropertyPaneState,
  (pane: PropertyPaneReduxState) => !!(pane.isVisible && pane.widgetId),
);

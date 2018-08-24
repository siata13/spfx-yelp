import * as React from "react";
import * as ReactDom from "react-dom";
import { Version, EnvironmentType, Environment } from "@microsoft/sp-core-library";
import { sp } from "@pnp/sp";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from "@microsoft/sp-webpart-base";

import * as strings from "SpFxYelpWebPartStrings";
import SpFxYelp from "./components/SpFxYelp";
import { ISpFxYelpProps } from "./components/ISpFxYelpProps";
import { ISPDataService } from "../../services/sp/ISPDataService";
import { YelpDataService, IYelpSearchProps } from "../../services/yelp/YelpDataService";
import { SPDataServiceProvider } from "../../services/sp/SPDataServiceProvider";
import { IYelpItem } from "../../model/IYelpItem";
import { ISPYelpItem } from "../../model/ISPYelpItem";

export interface ISpFxYelpWebPartProps {
  itemsToDisplayCount: number;

  location: string;
  searchTerm: string;
  apiKey: string;
}

export default class SpFxYelpWebPart extends BaseClientSideWebPart<ISpFxYelpWebPartProps> {
  private _yelpDataService: YelpDataService;
  private _spDataService: ISPDataService;

  private _cachedData: IYelpItem[] = null;
  private _tags: string[] = [];
  private _errorMessage: string = null;
  private _loadingData: boolean = false;

  public render(): void {
    const element: React.ReactElement<ISpFxYelpProps> = React.createElement(
      SpFxYelp,
      {
        itemsToDisplayCount: this.properties.itemsToDisplayCount,
        searchTerm: this.properties.searchTerm,
        location: this.properties.location,
        configureWebPart: this._configureWebPart,
        errorMessage: this._errorMessage,
        data: this._cachedData,
        loadingData: this._loadingData,
        tags: this._tags,

        // tslint:disable-next-line:max-line-length
        updateSPYelpTaggedVales: (spYelpItem: ISPYelpItem, selectedTags: string[]) => { return this._spDataService.updateSPYelpTaggedValues(spYelpItem, selectedTags); },
        ensureSPYelpItem: (yelpItem: IYelpItem) => { return this._spDataService.ensureSPYelpItem(yelpItem); }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        this._configureWebPart = this._configureWebPart.bind(this);

        this._yelpDataService = new YelpDataService(this.context.httpClient);
        this._spDataService = SPDataServiceProvider.getDataService(Environment.type);

        await super.onInit();
        sp.setup({
          spfxContext: this.context
        });

        this.properties.location = await this._spDataService.getUserLocation();
        this._tags = await this._spDataService.getAvailableTags();

        this._cachedData = await this._loadYelpData({
          location: this.properties.location,
          term: this.properties.searchTerm,
          apiKey: this.properties.apiKey
        });

      } catch (err) {
        this._errorMessage = "Cannot obtain data.";
      } finally {
        resolve();
      }
    });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  /**
   * Disable reactive mode of the web part.
   */
  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }
  /**
   * Check the changed property to determine if the cached data should be removed.
   * @param propertyPath
   * @param oldValue
   * @param newValue
   */
  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    // check if cached data should be removed
    if (propertyPath === "searchTerm" || propertyPath === "location" || propertyPath === "apiKey") {
      this._cachedData = null;
    }

    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
  }

  /**
   * Load
   */
  protected onPropertyPaneConfigurationComplete(): void {
    if (this._cachedData == null) {
      this._loadingData = true;

      const params: IYelpSearchProps = {
        term: this.properties.searchTerm,
        location: this.properties.location,
        apiKey: this.properties.apiKey
      };

      this._loadYelpData(params).then(data => {
        this._loadingData = false;
        this._cachedData = data;
        this._errorMessage = null;

        this.render();
      }).catch(error => {
        this._loadingData = false;
        this._errorMessage = "Cannot load data.";

        this.render();
      });
    }

    this.render();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("searchTerm", {
                  label: strings.SearchTermFieldLabel,
                  onGetErrorMessage: this._onPropertyPaneErrorValidation.bind(this)
                }),
                PropertyPaneTextField("location", {
                  label: strings.LocationFieldLabel,
                  onGetErrorMessage: this._onPropertyPaneErrorValidation.bind(this)
                }),
                PropertyPaneSlider("itemsToDisplayCount", {
                  min: 1,
                  max: 30,
                  value: this.properties.itemsToDisplayCount,
                  step: 1,
                  showValue: true,
                  label: strings.ItemsToDisplayCountFieldLabel
                }),
                PropertyPaneTextField("apiKey", {
                  label: strings.ApiKeyLabel,
                  onGetErrorMessage: this._onPropertyPaneErrorValidation.bind(this)
                }),
              ]
            }
          ]
        }
      ]
    };
  }

  /**
   * Method caches results. In case the display count changes, the data doesn't have to be reloaded.
   * @param params Data required to execute search.
   */
  private _loadYelpData(params: IYelpSearchProps): Promise<IYelpItem[]> {
    return new Promise<IYelpItem[]>(async (resolve, reject) => {
      try {
        if (!this._cachedData) {
          this._cachedData = await this._yelpDataService.getYelpResults(params);
        }
        if (this._cachedData == null) {
          this._errorMessage = "Cannot obtain data from service.";
          reject();
        }
        resolve(this._cachedData);
      } catch (err) {
        this._errorMessage = "Cannot obtain data from service.";
        reject("Cannot load data.");
      }
    });
  }

  /**
   * Method used to allow setting web parts configuration.
   */
  private _configureWebPart(): void {
    this.context.propertyPane.open();
  }

  private _onPropertyPaneErrorValidation(value: string): string {
    if (value === null || value.trim().length === 0) {
      return "Provide a value";
    }
    return "";
  }
}

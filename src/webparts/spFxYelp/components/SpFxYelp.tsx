import * as React from "react";
import { DefaultButton, IButtonProps } from "office-ui-fabric-react/lib/Button";
import { Spinner, SpinnerSize } from "office-ui-fabric-react/lib/Spinner";
import { ISpFxYelpProps } from "./ISpFxYelpProps";
import { IYelpItem } from "../../../model/IYelpItem";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";

import styles from "./SpFxYelp.module.scss";
import { SpFxYelpListItem } from "./SpFXYelpItem/SpFxYelpListItem";
import { ISpFxYelpState } from "./ISpFxYelpState";

export default class SpFxYelp extends React.Component<ISpFxYelpProps, ISpFxYelpState> {
  constructor(props: ISpFxYelpProps) {
    super(props);

    this._isWebPartConfigured = this._isWebPartConfigured.bind(this);
    this._getDataToDisplay = this._getDataToDisplay.bind(this);

    this.state = {
      data: undefined,
      loadingData: true
    };
  }

  public render(): React.ReactElement<ISpFxYelpProps> {
    const { itemsToDisplayCount, data, searchTerm, configureWebPart, errorMessage, loadingData, ensureSPYelpItem, tags } = this.props;

    if (loadingData) {
      return <Spinner size={SpinnerSize.large} label="Loading data..." />;
    }
    if (errorMessage) {
      return (
        <div>
          <MessageBar messageBarType={MessageBarType.error}>{errorMessage}</MessageBar>
          <DefaultButton text="Configure web part" onClick={configureWebPart} />
        </div>
      );
    }

    // check if WebPart needs configuration
    if (!this._isWebPartConfigured()) {
      return (
        <div>
          <MessageBar messageBarType={MessageBarType.warning}>WebPart requires configuration.</MessageBar>
          <DefaultButton text="Configure web part" onClick={configureWebPart} />
        </div>
      );
    }

    const dataToDisplay: IYelpItem[] = this._getDataToDisplay(data, itemsToDisplayCount);
    const header: string = `Yelp search: ${searchTerm}`;

    return (
      <div className={styles.spFxYelp}>
        <div className={styles.container}>
          <div>{header}</div>
          <div>{`Web part is going to display: ${itemsToDisplayCount} items.`}</div>
          <div>
            {
              dataToDisplay &&
              dataToDisplay.map(yelpItem => {
                return (
                  <SpFxYelpListItem
                    yelpItem={yelpItem}
                    ensureSPYelpItem={ensureSPYelpItem}
                    tags={tags}
                    updateSPYelpTaggedVales={this.props.updateSPYelpTaggedVales} />
                );
              })
            }
          </div>
        </div>
      </div>
    );
  }

  private _isWebPartConfigured(): boolean {
    const missingSearchTerm: boolean = (this.props.searchTerm == null && this.props.searchTerm === "");
    const missingLocation: boolean = (this.props.location == null && this.props.location === "");
    const missingData: boolean = this.props.data == null;

    return !(missingSearchTerm || missingLocation || missingData);
  }
  private _getDataToDisplay(data: IYelpItem[], itemsToDispaly: number): IYelpItem[] {
    if (data.length <= itemsToDispaly) {
      return data;
    }
    return data.slice(0, itemsToDispaly);
  }
}

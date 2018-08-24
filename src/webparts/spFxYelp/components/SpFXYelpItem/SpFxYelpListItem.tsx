import * as React from "react";
import { IYelpItem } from "../../../../model/IYelpItem";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { Image, ImageFit } from "office-ui-fabric-react/lib/Image";

import styles from "./SpFxYelpListItem.module.scss";
import { SpFxYelpSPListItemInfo } from "../SpFxYelpSPListItemInfo/SpFxYelpSPListItemInfo";
import { ISPYelpItem } from "../../../../model/ISPYelpItem";

export class ISpFxYelpListItemProps {
  yelpItem: IYelpItem;
  tags: string[];

  updateSPYelpTaggedVales: (spYelpItem: ISPYelpItem, selectedTags: string[]) => Promise<boolean>;
  ensureSPYelpItem: (yelpItem: IYelpItem) => Promise<ISPYelpItem>;
}

export interface ISpFxYelpListItemStyle {
  expanded: boolean;
}


export class SpFxYelpListItem extends React.Component<ISpFxYelpListItemProps, ISpFxYelpListItemStyle> {
  constructor(props: ISpFxYelpListItemProps) {
    super(props);

    this._expandItem = this._expandItem.bind(this);

    this.state = {
      expanded: false
    };
  }
  public render(): React.ReactElement<ISpFxYelpListItemProps> {
    const { yelpItem, ensureSPYelpItem, tags } = this.props;
    const { expanded } = this.state;

    return (
      <div className={styles.cellContainer}>
        <div className={styles.cellRow}>
          <Image
            src={yelpItem.imgUrl}
            width={50}
            height={50}
            imageFit={ImageFit.cover}
            className={styles.cellImg}
          />
          <div className={styles.cellData}>
            <div className={styles.cellDataHeader}>{yelpItem.name}</div>
            <div className={styles.cellAdditionalInfo}>{yelpItem.location.city}, {yelpItem.location.address1}</div>
          </div>
          <div className={styles.cellExpand}>
            <Icon iconName={expanded ? "ChevronLeft" : "ChevronRight"} onClick={this._expandItem} />
          </div>
        </div>
        {
          expanded &&
          <div className={styles.cellRow}>
            <SpFxYelpSPListItemInfo
              yelpItem={yelpItem}
              tags={tags}
              updateSPYelpTaggedVales={this.props.updateSPYelpTaggedVales}
              ensureSPYelpItem={ensureSPYelpItem} />
          </div>
        }
      </div>
    );
  }

  private _expandItem(): void {
    this.setState({
      expanded: !this.state.expanded
    });
  }
}

import * as React from "react";
import { IYelpItem } from "../../../../model/IYelpItem";
import { ISPYelpItem } from "../../../../model/ISPYelpItem";
import { Spinner, SpinnerType } from "office-ui-fabric-react/lib/Spinner";
import { MessageBar, MessageBarType } from "office-ui-fabric-react/lib/MessageBar";
import { SpFxYelpTags } from "./SpFxYelpTags";


export interface ISpFxYelpSPListItemInfoProps {
  yelpItem: IYelpItem;
  tags: string[];

  updateSPYelpTaggedVales: (spYelpItem: ISPYelpItem, selectedTags: string[]) => Promise<boolean>;
  ensureSPYelpItem: (yelpItem: IYelpItem) => Promise<ISPYelpItem>;
}
export interface ISpFxYelpSpListItemInfoState {
  spYelpItem: ISPYelpItem;
  loading: boolean;
  errorMessage: string;
  selectedTags: string[];
}

export class SpFxYelpSPListItemInfo extends React.Component<ISpFxYelpSPListItemInfoProps, ISpFxYelpSpListItemInfoState> {
  constructor(props: ISpFxYelpSPListItemInfoProps) {
    super(props);


    this.state = {
      spYelpItem: null,
      loading: true,
      errorMessage: null,
      selectedTags: null
    };
  }

  componentDidMount(): void {
    this.props.ensureSPYelpItem(this.props.yelpItem)
      .then(spYelpItem => {
        this.setState({
          spYelpItem: spYelpItem,
          loading: false,
          errorMessage: null,
          selectedTags: spYelpItem.tags
        });
      })
      .catch(reason => {
        this.setState({
          spYelpItem: null,
          loading: false,
          errorMessage: "Something went wrong..."
        });
      });
  }

  render(): React.ReactElement<ISpFxYelpSPListItemInfoProps> {
    const { tags, yelpItem } = this.props;
    const { spYelpItem, loading, errorMessage, selectedTags } = this.state;

    if (loading) {
      return <Spinner type={SpinnerType.normal} />;
    }
    if (errorMessage) {
      return <MessageBar messageBarType={MessageBarType.error}>{errorMessage}</MessageBar>;
    }

    return (
      <div>
        <div>{spYelpItem.title}</div>
        {
          (tags.length > 0) &&
          <SpFxYelpTags spYelpItem={spYelpItem} updateSPYelpTaggedVales={this.props.updateSPYelpTaggedVales} tags={tags} />
        }
      </div>
    );
  }


}

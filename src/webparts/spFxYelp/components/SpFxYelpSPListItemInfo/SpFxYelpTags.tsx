import * as React from "react";
import { MessageBarType, MessageBar } from "office-ui-fabric-react/lib/MessageBar";
import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import { DefaultButton } from "office-ui-fabric-react/lib/Button";

import { ISPYelpItem } from "../../../../model/ISPYelpItem";

export interface ISpFxYelpTagsProps {
  spYelpItem: ISPYelpItem;
  tags: string[];
  updateSPYelpTaggedVales: (spYelpItem: ISPYelpItem, selectedTags: string[]) => Promise<boolean>;
}
export interface ISpFxYelpTagsState {
  selectedTags: string[];
  loading: boolean;
  message: string;
  messageType: MessageBarType;
}

export class SpFxYelpTags extends React.Component<ISpFxYelpTagsProps, ISpFxYelpTagsState> {
  constructor(props: ISpFxYelpTagsProps) {
    super(props);

    this._tagItem = this._tagItem.bind(this);
    this._updateTagValues = this._updateTagValues.bind(this);

    this.state = {
      loading: false,
      message: null,
      messageType: null,
      selectedTags: this.props.spYelpItem.tags
    };
  }

  render(): React.ReactElement<ISpFxYelpTagsProps> {
    const { loading, message, messageType, selectedTags } = this.state;
    const tags: string[] = this.props.tags;

    return (
      <div>
        {
          tags.map(tag => {
            const isChecked: boolean = selectedTags.indexOf(tag) >= 0;
            return <Checkbox label={tag} onChange={(ev: any, checked: boolean) => { this._tagItem(tag, checked); }} checked={isChecked} />;
          })
        }
        <DefaultButton text="Update tagged values" onClick={this._updateTagValues} />
        {
          message &&
          <MessageBar messageBarType={messageType}>{message}</MessageBar>
        }
      </div>
    );
  }

  private _tagItem(tag: string, checked: boolean): void {
    let selectedTags: string[] = this.state.selectedTags;
    if (checked) {
      selectedTags.push(tag);
    } else {
      let index: number = selectedTags.indexOf(tag);
      if (index >= 0) {
        selectedTags.splice(index, 1);
      }
    }

    this.setState({
      selectedTags
    });
  }

  private _updateTagValues(): void {
    this.setState({
      loading: true
    });

    const selectedTags: string[] = this.state.selectedTags;
    const spYelpItem: ISPYelpItem = this.props.spYelpItem;

    this.props.updateSPYelpTaggedVales(spYelpItem, selectedTags)
      .then(result => {
        if (result) {
          this.setState({
            loading: false,
            message: "Values have been updated.",
            messageType: MessageBarType.success
          });
        } else {
          this.setState({
            loading: false,
            message: "Something went wrong..",
            messageType: MessageBarType.error
          });
        }
      })
      .catch(reason => {
        this.setState({
          loading: false,
          message: "Something went wrong..",
          messageType: MessageBarType.error
        });
      });

  }
}

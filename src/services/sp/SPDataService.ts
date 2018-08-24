import { ISPDataService } from "./ISPDataService";
import { IYelpItem } from "../../model/IYelpItem";
import { sp, ItemAddResult, ItemUpdateResult } from "@pnp/sp";
import { Constants } from "../../utilitites/Constants";
import { ISPYelpItem } from "../../model/ISPYelpItem";
import { taxonomy, ITermData, ITerm, ITermSet, ITermSetData, ITermGroup } from "@pnp/sp-taxonomy";
/**
 * Service saves/reads data from/to SP List.
 */
export class SPDataService implements ISPDataService {
  private _terms: (ITermData & ITerm)[];
  private _termSet: ITermSetData & ITermSet;
  private _termTextFieldInternalName: string = null
  ;
  public getAvailableTags(): Promise<string[]> {
    return new Promise<string[]>(async (resolve, reject) => {
      let result: string[] = [];
      try {
        let siteGroup: ITermGroup = taxonomy.getDefaultSiteCollectionTermStore().getSiteCollectionGroup(false);

        let termSet: ITermSetData & ITermSet = await siteGroup.termSets.getByName(Constants.TagTermSetName).get();
        let terms: (ITermData & ITerm)[] = await termSet.terms.get();

        this._terms = terms;
        this._termSet = termSet;

        result = this._terms.map(term => term.Name as string);
        resolve(result);
      } catch (err) {
        resolve(result);
      }
    });
  }
  public ensureSPYelpItem(yelpItem: IYelpItem): Promise<ISPYelpItem> {
    return new Promise<ISPYelpItem>(async (resolve, reject) => {
      try {
        let result: ISPYelpItem = await this.getSPYelpItem(yelpItem);
        if (result == null) {
          result = await this.createSPYelpItem(yelpItem);
        }

        resolve(result);
      } catch (err) {
        reject("Cannot find list item.");
      }
    });
  }

  public getUserLocation(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      let location: string = null;

      try {
        let userProperties: any = await sp.profiles.myProperties.get();
        if (userProperties != null) {
          let locationProperty: any = userProperties.UserProfileProperties.find(x => x.Key === Constants.LocationPropertyName);
          if (locationProperty != null) {
            location = locationProperty.Value;
          }
        }

        resolve(location);
      } catch (err) {
        resolve(location);
      }
    });
  }

  public updateSPYelpTaggedValues(spYelpItem: ISPYelpItem, selectedTags: string[]): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        // to update multi tax value, it's necessary to set note field value for tax field.
        let multiTermValue: string = "";
        let spItemId: number = spYelpItem.id;

        selectedTags.forEach(tag => {
          // find corresponding term by name
          const terms: (ITermData & ITerm)[] = this._terms.filter(x => (x.Name as string) === tag);

          if (terms.length > 0) {
            // simplify
            const term: (ITermData & ITerm) = terms[0];
            multiTermValue += `-1#;${term.Name}|${this._cleanGuid(term.Id)};#`;
          }
        });

        if (multiTermValue !== "") {
          multiTermValue = multiTermValue.slice(0, multiTermValue.length - 1);
        }

        if (this._termTextFieldInternalName == null) {
          const textFieldTitle:string = Constants.TagFieldName + "_0";
          const taxField: any = await sp.web.lists.getByTitle(Constants.SPYelpDataListName).fields.getByTitle(textFieldTitle).get();
          this._termTextFieldInternalName = taxField.InternalName;
        }

        const updateProps: any = {};
        updateProps[this._termTextFieldInternalName] = multiTermValue;

        await sp.web.lists.getByTitle(Constants.SPYelpDataListName).items.getById(spYelpItem.id).update(updateProps);
        resolve (true);
      } catch (err) {
        resolve(false);
      }
    });
  }

  getSPYelpItem(yelpItem: IYelpItem): Promise<ISPYelpItem> {
    return new Promise<ISPYelpItem>(async (resolve, reject) => {
      try {
        let result: ISPYelpItem = null;

        // tslint:disable-next-line:max-line-length
        // `${Constants.YelpItemIdFieldName} eq '${yelpItem.id}'
        // tslint:disable-next-line:max-line-length
        let items: any = await sp.web.lists.getByTitle(Constants.SPYelpDataListName).items.filter("YelpItemId eq '" + yelpItem.id + "'").get();

        if (items.length > 0) {
          let spItem: any = items[0];

          let tags: string[] = spItem[Constants.TagFieldName].map(x => x.Label);
          result = {
            id: spItem.Id,
            title: spItem.Title,
            yelpItemId: spItem[Constants.YelpItemIdFieldName],
            tags: tags
          };
        }
        resolve(result);
      } catch (err) {
        resolve(null);
      }
    });
  }

  createSPYelpItem(yelpItem: IYelpItem): Promise<ISPYelpItem> {
    return new Promise<ISPYelpItem>(async (resolve, reject) => {
      try {
        let result: ISPYelpItem = null;
        const item: ItemAddResult = await sp.web.lists.getByTitle(Constants.SPYelpDataListName).items.add({
          Title: yelpItem.name,
          YelpItemId: yelpItem.id
        });
        const spItem: any = await item.item.get();
        result = {
          id: spItem.Id,
          title: spItem.Title,
          yelpItemId: spItem[Constants.YelpItemIdFieldName],
          tags: []
        };

        resolve(result);
      } catch (err) {
        reject("Cannot find list item.");
      }
    });
  }

  private _cleanGuid(guid: string): string {
		if (guid !== undefined) {
			return guid.replace("/Guid(", "").replace("/", "").replace(")", "");
		} else {
			return "";
		}
	}
}

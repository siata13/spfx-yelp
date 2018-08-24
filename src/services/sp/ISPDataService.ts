import { IYelpItem } from "../../model/IYelpItem";
import { ISPYelpItem } from "../../model/ISPYelpItem";

/**
 * Decalration of the methods to communicate with SP.
 */
export interface ISPDataService {
  getAvailableTags(): Promise<string[]>;
  ensureSPYelpItem(yelpItem: IYelpItem): Promise<ISPYelpItem>;
  getUserLocation(): Promise<string>;
  updateSPYelpTaggedValues: (spYelpItem: ISPYelpItem, selectedTags: string[]) => Promise<boolean>;
}

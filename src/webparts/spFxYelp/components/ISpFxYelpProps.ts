import { IYelpItem } from "../../../model/IYelpItem";
import { IYelpSearchProps } from "../../../services/yelp/YelpDataService";
import { ISPYelpItem } from "../../../model/ISPYelpItem";

export interface ISpFxYelpProps {
  itemsToDisplayCount: number;
  searchTerm: string;
  location: string;
  data: IYelpItem[];
  tags: string[];

  loadingData: boolean;
  errorMessage: string;

  configureWebPart: () => void;
  updateSPYelpTaggedVales: (spYelpItem: ISPYelpItem, selectedTags: string[]) => Promise<boolean>;
  ensureSPYelpItem: (yelpItem: IYelpItem) => Promise<ISPYelpItem>;
}

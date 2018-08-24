import { ISPDataService } from "./ISPDataService";
import { IYelpItem } from "../../model/IYelpItem";
import { ISPYelpItem } from "../../model/ISPYelpItem";

/**
 * Service saves/reads data from/to localstorage in case of workbench.
 * TODO: Implement local storage caching/logic.
 */
export class MockSPDataService implements ISPDataService {
  public ensureSPYelpItem(yelpItem: IYelpItem): Promise<ISPYelpItem> {
    return null;
  }

  public getAvailableTags(): Promise<string[]> {
    return null;
  }

  public getUserLocation(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      setTimeout(() => {
        resolve("Cracow");
      }, 3000);
    });
  }
  public updateSPYelpTaggedValues(spYelpItem: ISPYelpItem, selectedTags: string[]): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      resolve(true);
    });
  }
}

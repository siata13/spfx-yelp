import { Environment, EnvironmentType} from "@microsoft/sp-core-library";
import { MockSPDataService } from "./MockSPDataService";
import { SPDataService } from "./SPDataService";
import { ISPDataService } from "./ISPDataService";

export class SPDataServiceProvider {
  public static getDataService(envType: EnvironmentType): ISPDataService {
    if (envType === EnvironmentType.Local) {
      return new MockSPDataService();
    } else if (envType === EnvironmentType.SharePoint) {
      return new SPDataService();
    }

    return null;
  }
}

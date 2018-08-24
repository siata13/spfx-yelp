import { IYelpItem } from "../../../model/IYelpItem";

export interface ISpFxYelpState {
  data: IYelpItem[];
  loadingData: boolean;
}

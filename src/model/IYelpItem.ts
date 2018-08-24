export interface IYelpLocation {
  city: string;
  country: string;
  address1: string;
  address2: string;
  address3: string;
  state: string;
  zip_code: string;
}
export interface IYelpItem {
  name: string;
  location: IYelpLocation;
  id: string;
  imgUrl: string;
}

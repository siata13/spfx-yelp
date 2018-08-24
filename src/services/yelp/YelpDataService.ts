import { HttpClient, IHttpClientOptions, HttpClientConfiguration, HttpClientResponse } from "@microsoft/sp-http";
import { IYelpItem } from "../../model/IYelpItem";

export class IYelpSearchProps {
  term: string;
  location: string;
  apiKey: string;
}

export class YelpDataService {
  private _httpClient: HttpClient;
  // as Yepl doesn't support CORS calls -> call internal AzureFunction instead
  private _yelpSearchEndpoint = "https://spfx-yelp.azurewebsites.net/api/yelpfunction";

  constructor(httpClient: HttpClient) {
    this._httpClient = httpClient;
  }

  public getYelpResults(params: IYelpSearchProps): Promise<IYelpItem[]> {
    return new Promise<IYelpItem[]>(async (resolve, reject) => {
      try {
        const url: string = this._prepareUrl(params);
        const response: any = await this._httpClient.get(url, HttpClient.configurations.v1, {});
        const responseBody: string = await response.text();

        const result: IYelpItem[] = this._parseYelpData(responseBody);

        resolve(result);
      } catch(err) {
        reject("Cannot obtain data from Yelp service");
      }
    });
  }

  private _prepareUrl(params: IYelpSearchProps): string {
    let url: string = `${this._yelpSearchEndpoint}?apiKey=${params.apiKey}&location=${params.location}`;
    if (params.term !== "") {
      url = `${url}&term=${params.term}`;
    } else {
      url = `${url}&term=coffee`;
    }
    return url;
  }

  private _parseYelpData(value: string): IYelpItem[] {
    const result: IYelpItem[] = [];

    if (value != null && value !== "") {
      let parsedObject: any = JSON.parse(value);
      parsedObject.businesses.forEach(business => {
        result.push({
          id: business.id,
          name: business.name,
          location: business.location,
          imgUrl: business.image_url
        });
      });

    }
    return result;
  }
}

declare interface ISpFxYelpWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;

  ItemsToDisplayCountFieldLabel: stirng;
  SearchTermFieldLabel: string;
  LocationFieldLabel: string;
  ApiKeyLabel: string;
}

declare module 'SpFxYelpWebPartStrings' {
  const strings: ISpFxYelpWebPartStrings;
  export = strings;
}

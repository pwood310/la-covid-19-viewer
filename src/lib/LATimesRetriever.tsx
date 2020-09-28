import axios from "axios";
import { CSVToObjectTransformer } from "./CSVToObjectTransformer";

const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";

export type PlaceTotalsType = {
  date: string; //	The date when the data were retrieved in ISO 8601 format.
  county: string; //The name of the county where the city is located.
  fips: string; //	The FIPS code given to the county by the federal government. Can be used to merge with other data sources.
  place: string; //	The name of the city, neighborhood or other area.
  confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
  note: string; //	In cases where the confirmed_cases are obscured, this explains the range of possible values.
  x: number; //float	The longitude of the place.
  y: number; //	float
};

export type CountyTotalsType = {
  county: string; //	The name of the county where the agency is based.
  fips: string; //	The FIPS code given to the county by the federal government. Can be used to merge with other data sources.
  date: string; //The date when the data were retrieved in ISO 8601 format.
  confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
  deaths: number; // integer	The cumulative number of deaths at that time.
  new_confirmed_cases: number; //	integer	The net change in confirmed cases over the previous date.
  new_deaths: number; //	integer	The net change in deaths over the previous date.
};

export class LATimesRetriever {
  uriBase: string | undefined;
  endpoint: string;
  csvTransformer: CSVToObjectTransformer;

  constructor(uriBase?: string) {
    //console.log("LATimesRetriever.ctor()");
    this.uriBase = uriBase ?? URIBase;
    this.csvTransformer = new CSVToObjectTransformer();
  }

  async retrieveCountyTotals(): Promise<CountyTotalsType[]> {
    const fileContents:string = await this.retrieve("latimes-county-totals.csv");
    const transformed:CountyTotalsType[] = await this.csvTransformer.transform(fileContents);
  
    return transformed;  
  }
  
  async retrievePlaceTotals(): Promise<PlaceTotalsType[]> {
     const fileContents:string = await this.retrieve("latimes-place-totals.csv");
     const transformed:PlaceTotalsType[] = await this.csvTransformer.transform(fileContents);
     return transformed;
  }
  
  async retrieve(filename): Promise<string> {
    const uri = `${this.uriBase}/${filename}`;
    try {
      console.log("calling axios!");
      const result = await axios(uri);
      if (!result || result.status !== 200) {
        let err = result ? result.status : result;
        console.error(
          "bad status from axios retrieve: ", err );
        throw new Error(`LATimesRetriever.retrieve(${uri}) failed: ${err}`);
      }
      return result.data;
    } catch (e) {
      console.error(`retrieve(${uri}): caught exception: ${e}`);
      throw e;
    }
  }

  
  async oldRetrieve(filename): Promise<any[]> {
    const uri = `${this.uriBase}/${this.endpoint}`;
    try {
      console.log("calling axios!");
      const result = await axios(uri);
      if (!result || result.status !== 200) {
        console.error(
          "bad status from axios retrieve: ",
          result ? result.status : result
        );
        throw new Error(`LATimesRetriever: axios failed to retrieve ${uri}`);
      }
      const transformed = await this.csvTransformer.transform(result.data);
      return transformed;
    } catch (e) {
      console.error(`retrieve: caught exception: ${e}`);
      throw e;
    }
  }
};
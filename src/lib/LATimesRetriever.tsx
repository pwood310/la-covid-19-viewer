import axios from "axios";
import {CSVToObjectTransformer} from "./CSVToObjectTransformer";


const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";

// export type BaseTotalsType = {
//   date: string; //	The date when the data were retrieved in ISO 8601 format.
//   county: string; //The name of the county where the city is located.
//   fips: string; //	The FIPS code given to the county by the federal government. Can be used to merge with other data sources.
// };
//
// export interface PlaceTotalsType extends BaseTotalsType {
//   id: string,
//   date: string; //	The date when the data were retrieved in ISO 8601 format.
//   county: string; //The name of the county where the city is located.
//   fips: string; //	The FIPS code given to the county by the federal government. Can be used to merge with other data sources.
//   name: string; //	formerly called 'place': The name of the city, neighborhood or other area.
//   confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
//   note: string; //	In cases where the confirmed_cases are obscured, this explains the range of possible values.
//   x: number; //float	The longitude of the place.
//   y: number; //	float
// };
//
// export interface CountyTotalsType extends BaseTotalsType {
//   county: string; //	The name of the county where the agency is based.
//   fips: string; //	The FIPS code given to the county by the federal government. Can be used to merge with other data sources.
//   date: string; //The date when the data were retrieved in ISO 8601 format.
//   confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
//   deaths: number; // integer	The cumulative number of deaths at that time.
//   new_confirmed_cases: number; //	integer	The net change in confirmed cases over the previous date.
//   new_deaths: number; //	integer	The net change in deaths over the previous date.
// };


export type CountyDateTotal = {
  date: string; //The date when the data were retrieved in ISO 8601 format.
  confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
  deaths: number; // integer	The cumulative number of deaths at that time.
  new_confirmed_cases: number; //	integer	The net change in confirmed cases over the previous date.
  new_deaths: number; //	integer	The net change in deaths over the previous date.
};

export type CountyTotals = {
  recordCount: number;
  countyToTotals: { [key: string]: Array<CountyDateTotal> }
};

export type PlaceDateTotal = {
  date: string; //The date when the data were retrieved in ISO 8601 format.
  confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
  new_confirmed_cases: number; //	integer	The net change in confirmed cases over the previous date.
}

export type PlaceTotals = {
  recordCount: number;
  countyToPlaceData: { [county: string]: { [name: string]: Array<PlaceDateTotal> } };
};


export class LATimesRetriever {
  uriBase: string | undefined;
  csvTransformer: CSVToObjectTransformer;

  constructor(uriBase?: string) {
    //console.log("LATimesRetriever.ctor()");
    this.uriBase = uriBase ?? URIBase;
    this.csvTransformer = new CSVToObjectTransformer();
  }

  async retrieveCountyTotals(): Promise<CountyTotals> {
    const fileContents: string = await this.retrieve("latimes-county-totals.csv");

    const countyToTotals = {};
    const rv: CountyTotals = {
      recordCount: 0,
      countyToTotals: countyToTotals
    };

    let lineTransformer = (line) => {

      if (!rv.countyToTotals[line.county])
        countyToTotals[line.county] = [];

      let rows = countyToTotals[line.county];
      let row = {
        date: line.date,  //new Date(line.date),
        confirmed_cases: Number(line.confirmed_cases),
        deaths: Number(line.deaths),
        new_confirmed_cases: Number(line.new_confirmed_cases),
        new_deaths: Number(line.new_deaths),
      };
      rows.push(row);
    };

    rv.recordCount = await this.csvTransformer.transformNew(fileContents, lineTransformer);

    return rv;
  }


  async retrievePlaceTotals(): Promise<PlaceTotals> {
    const fileContents: string = await this.retrieve("latimes-place-totals.csv");

    let mapCountyToPlaceToRows = {};

    const rv: PlaceTotals = {
      recordCount: 0,
      countyToPlaceData: mapCountyToPlaceToRows
    };

    let lineTransformer = (line) => {

      if (!mapCountyToPlaceToRows[line.county])
        mapCountyToPlaceToRows[line.county] = {};

      let places = mapCountyToPlaceToRows[line.county];
      if (!places[line.name])
        places[line.name] = [];

      let rows = places[line.name];

      let row = {
        date: line.date, //new Date(line.date),
        confirmed_cases: Number(line.confirmed_cases),
        population: Number(line.population),
      };
      rows.push(row);
    };
    rv.recordCount = await this.csvTransformer.transformNew(fileContents, lineTransformer);

    return rv;
  }

  async retrieve(filename: string): Promise<string> {
    const uri = `${this.uriBase}/${filename}`;
    try {
      console.debug(`retrieve() calling axios with uri=${uri}`);
      const result = await axios.get(uri);
      // console.debug("result", result)
      if (!result || result.status !== 200) {
        let err = result ? result.status : result;
        console.error(
          "bad status from axios retrieve: ", err);
        throw new Error(`LATimesRetriever.retrieve(${uri}) failed: ${err}`);
      }
      return result.data;
    } catch (e) {
      console.error(`retrieve(${uri}): caught exception: ${e}`);
      throw e;
    }
  }

};

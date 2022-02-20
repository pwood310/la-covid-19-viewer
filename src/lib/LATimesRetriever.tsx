import axios from "axios";
import { CountyTotals, PlaceTotals } from "./SimpleTypes";
import {CSVToObjectTransformer} from "./CSVToObjectTransformer";


const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";

export class LATimesRetriever {
  uriBase: string | undefined;
  csvTransformer: CSVToObjectTransformer;

  constructor(uriBase?: string) {
    //console.log("LATimesRetriever.ctor()");
    this.uriBase = uriBase ?? URIBase;
    this.csvTransformer = new CSVToObjectTransformer();
  }

  async oldRetrieveCountyTotals(): Promise<CountyTotals> {
    let fileContents: string = await this.retrieve("latimes-county-totals.csv");

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
        date: new Date(line.date+"T00:00:00"),
        confirmed_cases: Number(line.confirmed_cases),
        deaths: Number(line.deaths),
        new_confirmed_cases: Number(line.new_confirmed_cases),
        new_deaths: Number(line.new_deaths),
      };
      rows.push(row);
    };

    rv.recordCount = await this.csvTransformer.transformNew(fileContents, lineTransformer);
    fileContents = null;
    return rv;
  }

  async retrieveCountyTotals(): Promise<CountyTotals> {
    let fileContents: string = await this.retrieve("cdph-county-cases-deaths.csv");

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
        date: new Date(line.date+"T00:00:00"),
        confirmed_cases: Number(line.reported_cases),
        deaths: Number(line.reported_deaths),
        new_confirmed_cases: Number(0),
        new_deaths: Number(0),
      };
      rows.push(row);
    };

    rv.recordCount = await this.csvTransformer.transformNew(fileContents, lineTransformer);
    fileContents = null;
    return rv;
  }


  async retrievePlaceTotals(): Promise<PlaceTotals> {
    let fileContents: string = await this.retrieve("latimes-place-totals.csv");

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
        date: new Date(line.date+"T00:00:00"),
        confirmed_cases: Number(line.confirmed_cases),
        population: Number(line.population),
      };
      rows.push(row);
    };
    rv.recordCount = await this.csvTransformer.transformNew(fileContents, lineTransformer);
    fileContents = null
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

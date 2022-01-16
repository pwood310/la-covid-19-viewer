import { CSVToObjectTransformer } from "./CSVToObjectTransformer";
import https from "https";

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
  date: Date; //The date when the data were retrieved in ISO 8601 format.
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
  date: Date; //The date when the data were retrieved in ISO 8601 format.
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
    let readerStream: any = await this.retrieveAsStream("cdph-county-cases-deaths.csv");

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
        date: line.date,
        confirmed_cases: line.reported_cases,
        deaths: line.reported_deaths,
        new_confirmed_cases: Number(0),
        new_deaths: Number(0),
      };
      rows.push(row);
    };

    rv.recordCount = await this.csvTransformer.transformStream(readerStream, lineTransformer);
    return rv;
  }


  async retrievePlaceTotals(): Promise<any> {
    let readerStream: any = await this.retrieveAsStream("latimes-place-totals.csv");

    let mapCountyToPlaceToRows = {};

    const rv: PlaceTotals = {
      recordCount: 0,
      countyToPlaceData: mapCountyToPlaceToRows
    };

    let lineTransformer = (line) => {

      let places = mapCountyToPlaceToRows[line.county];
      if (!places) {
        places = {};
        mapCountyToPlaceToRows[line.county] = places;
      }

      let rows = places[line.name]
      if (!rows) {
        rows = [];
        places[line.name] = rows;
      }

      let row = {
        date: line.date,
        confirmed_cases: line.confirmed_cases,
  //      population: line.population,
      };
      rows.push(row);
    };
    rv.recordCount = await this.csvTransformer.transformStream(readerStream, lineTransformer);
    return rv;
  }

  async retrievePlaceTotalsNew(): Promise<any> {
    let readerStream: any = await this.retrieveAsStream("latimes-place-totals.csv");

    let mapCountyToPlaceToRows = {};

    const rv: PlaceTotals = {
      recordCount: 0,
      countyToPlaceData: mapCountyToPlaceToRows
    };

    let trimmedRecs = [];
    let lineTrimmer = (line) => {
      trimmedRecs.push({
        name: line.name,
        date: line.date,
        county: line.county,
        confirmed_cases: line.confirmed_cases,
   //     population: line.population
      });
    };

    let lineTransformer = (line) => {

      let places = mapCountyToPlaceToRows[line.county];
      if (!places) {
        places = {};
        mapCountyToPlaceToRows[line.county] = places;
      }

      let rows = places[line.name]
      if (!rows) {
        rows = [];
        places[line.name] = rows;
      }

      let row = {
        date: line.date,
        confirmed_cases: line.confirmed_cases,
   //     population: line.population
      };
      rows.push(row);
    };
    rv.recordCount = await this.csvTransformer.transformStream(readerStream, lineTrimmer);

    for (let r of trimmedRecs) {
      lineTransformer(r);
    }
    return rv;
  }



  // return a stream
  async retrieveAsStream(filename: string): Promise<any> {
    const uri = `${this.uriBase}/${filename}`;

    return new Promise((resolve, reject) => {
      try {
        // console.debug(`retrieve() calling get with uri=${uri}`);
        const request = https.get(uri);
        request.on('response', (res) => {
          if (!res || res.statusCode != 200) {
            let err = res ? res.statusCode : res;
            console.error(
              "got bad status from https retrieve: ", err);
            return reject(`status code ${err}`);
          }

          res.setEncoding('utf8');
          return resolve(res);
        });
        // request.on('error', (error) => {
        //   console.error(`retrieve(${uri}): got error: ${error}`);
        //   throw error;
        // });

      } catch (e) {
        console.error(`retrieve(${uri}): caught exception: ${e}`);
        reject(e);
      }
    });
  }

};

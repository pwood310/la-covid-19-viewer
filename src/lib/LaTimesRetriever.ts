import axios from "axios";
import csvParse from "csv-parse";
import fs from "fs";

const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";

const CountyTotalSelector = "latimes-county-totals.csv";

class LaTimesRetriever {
  endpointData: object[];
  uriBase: string | undefined;
  endpoint: string;
  isReady: boolean;

  constructor(endpoint: string, uriBase?: string) {
    this.endpointData = [];
    // if (typeof endpoint === 'undefined')
    //   throw new Error("Yow!");
    this.endpoint = endpoint.match(/\.csv$/) ? endpoint : endpoint + '.csv';

    this.uriBase = uriBase ?? URIBase;
    this.isReady = false;
  }

  async retrieve(refresh: boolean = false): Promise<object[]> {
    if (this.endpointData && !refresh && this.isReady)
      return [...this.endpointData];

    // TODO: race condition
    this.endpointData = [];
    this.isReady = false;
    const uri = `${this.uriBase}/${this.endpoint}`;
    console.log("Querying ", uri);
    const result = await axios(uri);
    console.log("got header", result.data[0]);
    console.log("got data", result.data[1]);

    const transformed = await this.transformCSVToObjects(result.data);
    this.endpointData = transformed;


    this.isReady = true;
    return [...this.endpointData];
  }

  async transformCSVToObjects(csvString: string): Promise<any[]> {
    const namesToTypes: Map<string, string> = new Map([
      ["date", "date"],
      ["county", "string"],
      ["fips", "string"]
    ]);



    return new Promise((resolve, reject) => {
      csvParse(csvString, {
        comment: '#',
        columns: true,
        cast: function (value: string, context: any) {
          if (context.header)
            return value;


          const type = namesToTypes.get(context.column) ?? "number"
          switch (type) {
            case 'date':
              return new Date(value);
              break;

            case 'string':
              return value;
              break;

            case 'number':
              if (value === '')
                return null;
              try {
                return Number(value);
              }
              catch (e) {
                console.error(`While parsing column:'${context.column}', value:'${value}, caught:${e} `)
                return "null";
              }
              break;

            default:
              throw new Error(`Can't hydrate type ${type} for column ${context.column}`)
          }






          return value;
          // if (context.header)
          //   return context;

          // if (context.index === 0) {
          //   return 'Date';
          // } else if (context.index === 2) {
          //   return 'number'
          // }
          // else return 'string';
        },
      }, (err, output) => {
        if (err) reject(err);
        resolve(output);
      });
    });
  }
}

export default LaTimesRetriever;

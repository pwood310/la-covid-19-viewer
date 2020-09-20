import axios from "axios";
import csvParse from "csv-parse";
import fs from "fs";

const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";

const CountyTotalSelector = "latimes-county-totals.csv";

class LaTimesRetriever {
  uriBase: string | undefined;
  endpoint: string;
  thePromise: Promise<object[]> | null;
  isInProgress: boolean;

  constructor(endpoint: string, uriBase?: string) {
    this.endpoint = endpoint.match(/\.csv$/) ? endpoint : endpoint + '.csv';

    this.uriBase = uriBase ?? URIBase;
    this.isInProgress = true;
    this.thePromise = null;

  }

  async retrieve(refresh: boolean = false): Promise<object[]> {

    if (this.thePromise !== null) {
      if (!refresh || this.isInProgress)
        return this.thePromise;
    }

    this.isInProgress = true;
    this.thePromise = new Promise ( async (resolve, reject) => {

      const uri = `${this.uriBase}/${this.endpoint}`;
      try {
        const result = await axios(uri);
        if (!result || result.status != 200) {
          console.error("bad status from axios retrieve: ", result ? result.status : result);
          this.isInProgress = false;
          return reject(new Error(`Can't retrieve ${uri}`));
        }

        const transformed = await this.transformCSVToObjects(result.data);
        this.isInProgress = false;
        this.thePromise = null;
        resolve(transformed);
      }
      catch (e) {
        this.isInProgress = false;
        this.thePromise = null;
        console.error(`retrieve: caught error: ${e}`);
        reject(e)
      }

    });
    return this.thePromise;
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

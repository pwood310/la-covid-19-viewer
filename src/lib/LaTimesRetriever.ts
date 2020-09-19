import axios from "axios";
import csvParse from "csv-parse";

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
    
    //const transformed = await transformData(result.data);
    this.endpointData = result.data;
    this.isReady = true;
    return [...this.endpointData];
  }
  
  static async transformCSVToJSON(csvArray:any): Promise<object[]> {
    return [];
  }


}

export default LaTimesRetriever;

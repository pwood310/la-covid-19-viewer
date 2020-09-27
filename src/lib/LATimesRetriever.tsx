import axios from "axios";
import { CSVToObjectTransformer } from "./CSVToObjectTransformer";

const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";


export class LATimesRetriever {
  uriBase: string | undefined;
  endpoint: string;
  csvTransformer: CSVToObjectTransformer;

  constructor(endpoint: string, uriBase?: string) {
    //console.log("LATimesRetriever.ctor()");
    this.endpoint = endpoint.match(/\.csv$/) ? endpoint : endpoint + ".csv";
    this.uriBase = uriBase ?? URIBase;
    this.csvTransformer = new CSVToObjectTransformer();
  }

  async retrieve(refresh: boolean = false): Promise<any[]> {
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
}

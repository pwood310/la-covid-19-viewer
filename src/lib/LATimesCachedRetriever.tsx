import axios from "axios";
import { CSVToObjectTransformer } from "./CSVToObjectTransformer";

const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";

export class LATimesCachedRetriever {
  uriBase: string | undefined;
  endpoint: string;
  thePromise: Promise<object[]> | undefined;
  isInProgress: boolean;
  csvTransformer: CSVToObjectTransformer;

  constructor(endpoint: string, uriBase?: string) {
    console.log("constructor called for LATimesCachedRetriever");
    this.endpoint = endpoint.match(/\.csv$/) ? endpoint : endpoint + ".csv";
    this.uriBase = uriBase ?? URIBase;
    this.isInProgress = true;
    this.thePromise = undefined;
    this.csvTransformer = new CSVToObjectTransformer();
  }

  async retrieve(refresh: boolean = false): Promise<object[]> {
    console.log(`typeof promise? ${typeof this.thePromise}`);
    if (typeof(this.thePromise) !== "undefined") {
      if (!refresh || this.isInProgress) {
        console.log('returning existing promise');
        return this.thePromise;
      }
    }

    let that = this;
    that.isInProgress = true;
    let aPromise = new Promise<object[]>(async (resolve, reject) => {
      const uri = `${this.uriBase}/${this.endpoint}`;
      try {
        console.log("calling axios!");
        const result = await axios(uri);
        if (!result || result.status !== 200) {
          console.error(
            "bad status from axios retrieve: ",
            result ? result.status : result
          );
          that.isInProgress = false;
          return reject(new Error(`Can't retrieve ${uri}`));
        }

        const transformed = await this.csvTransformer.transform(result.data);
        that.isInProgress = false;
        that.thePromise = undefined;
        resolve(transformed);
      } catch (e) {
        that.isInProgress = false;
        that.thePromise = undefined;
        console.error(`retrieve: caught error: ${e}`);
        reject(e);
      }
    });
    
    if (this.isInProgress)
      this.thePromise = aPromise;

    return aPromise;
  }
}

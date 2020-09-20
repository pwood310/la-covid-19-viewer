import axios from "axios";
import CSVToObjectTransformer from "./CSVToObjectTransformer";

const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";

const CountyTotalSelector = "latimes-county-totals.csv";

class LATimesRetriever {
  uriBase: string | undefined;
  endpoint: string;
  thePromise: Promise<object[]> | null;
  isInProgress: boolean;
  csvTransformer: CSVToObjectTransformer;

  constructor(endpoint: string, uriBase?: string) {
    this.endpoint = endpoint.match(/\.csv$/) ? endpoint : endpoint + '.csv';

    this.uriBase = uriBase ?? URIBase;
    this.isInProgress = true;
    this.thePromise = null;
    this.csvTransformer = new CSVToObjectTransformer();

  }

  async retrieve(refresh: boolean = false): Promise<object[]> {

    if (this.thePromise !== null) {
      if (!refresh || this.isInProgress)
        return this.thePromise;
    }

    this.isInProgress = true;
    this.thePromise = new Promise(async (resolve, reject) => {

      const uri = `${this.uriBase}/${this.endpoint}`;
      try {
        const result = await axios(uri);
        if (!result || result.status != 200) {
          console.error("bad status from axios retrieve: ", result ? result.status : result);
          this.isInProgress = false;
          return reject(new Error(`Can't retrieve ${uri}`));
        }

        const transformed = await this.csvTransformer.transform(result.data);
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
}

export default LATimesRetriever;

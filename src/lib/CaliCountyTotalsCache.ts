import { IDataCache } from "./IDataCache";
import { LATimesRetriever } from "./LATimesRetriever";

export class CaliCountyTotalsCache implements IDataCache {
    readonly CountyTotalsSelector: string = "latimes-county-totals.csv";
    retriever: LATimesRetriever;


    constructor() {
        this.retriever = new LATimesRetriever(this.CountyTotalsSelector);
    }

    async get(refresh?: boolean): Promise<any[]> {
        return this.retriever.retrieve(refresh);
    }
}
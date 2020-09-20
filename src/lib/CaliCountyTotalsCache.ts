import LATimesRetriever from "./LATimesRetriever";

interface IDataCache {
    get(refresh?: boolean): Promise<any[]>;
}

class CaliCountyTotalsCache implements IDataCache {
    readonly CountyTotalsSelector:string = "latimes-county-totals.csv";

    retriever: LATimesRetriever;


    constructor() {
        this.retriever = new LATimesRetriever(this.CountyTotalsSelector);
    }

    async get(refresh?: boolean): Promise<any[]> {
        return this.retriever.retrieve(refresh);
    }

}
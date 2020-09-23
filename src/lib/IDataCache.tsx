export interface IDataCache {
    get(refresh?: boolean): Promise<any[]>;
}

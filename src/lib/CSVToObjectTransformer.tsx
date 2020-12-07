import csvParse from "csv-parse";

export class CSVToObjectTransformer {
    readonly DefaultNameToTypeInitializer: [string, string][] = [
        //["date", "date"],
        ["date", "string"],
        ["county", "string"],
        ["fips", "string"],
        ["place", "string"],
        ["note", "string"]
    ];

    nameToTypeMap: Map<string, string>;

    constructor(nameToTypeInitializer?: [string, string][]) {
        if (!nameToTypeInitializer)
            nameToTypeInitializer = this.DefaultNameToTypeInitializer;

        this.nameToTypeMap = new Map<string, string>(nameToTypeInitializer);
    }
    // because of the way the castingFunction is used by csv-parse, we do a trick
    // to keep the this from binding dynamically in the calling context
    // that way the 'this.nameToTypeMap' still refers to our object-local value
    castingFunction = (value: string, context: csvParse.CastingContext): any => {
        if (context.header)
            return value;

        const type = this.nameToTypeMap.get(context.column.toString()) ?? "number"
        switch (type) {
            case 'date':
                return new Date(value);

            case 'string':
                return value;
 
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
  
            default:
                throw new Error(`Can't hydrate type ${type} for column ${context.column}`)
        }
    }

    async transform(csvString: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            csvParse(csvString, {
                columns: true,
                cast: this.castingFunction
            }, (err, output) => {
                if (err) reject(err);
                resolve(output);
            });
        });
    }
}


import { CountyTotals, PlaceDateTotal, PlaceTotals } from "./SimpleTypes";


const base = 'https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master';
//const places = "cdph-county-cases-deaths.csv";
const places = 'latimes-place-totals.csv';
const url = `${base}/${places}`;

//const url = 'http://localhost:8000/';

async function myFunction() {
	console.log('getting it')
	// let doc = await retrieveAllAtOnce(url);
	let rows:any = await retrieveStream(url);
	let text = `here's doc ${rows.length} * ${rows[0]} ` + JSON.stringify(rows[0])
	console.log('got it');
//	document.getElementById("demo").innerHTML = text;
}
export async function myNodeFunction(): Promise<string> {
	console.log('getting it')
	// let doc = await retrieveAllAtOnce(url);
	let rows:any = await retrieveStream(url);
	let text = `here's doc ${rows.length} * ${rows[0]} ` + JSON.stringify(rows[0])
	console.log('got it');
	return text;
}

async function* makeTextFileLineIterator(readableStream:ReadableStream<Uint8Array>): AsyncGenerator<any, void, unknown> {
	const utf8Decoder:any = new TextDecoder("utf-8");
	let reader = readableStream.getReader();
	let { value: chunk8, done: readerDone } = await reader.read();
	let chunk = chunk8 ? utf8Decoder.decode(chunk8, { stream: true }) : "";

	let re:RegExp = /\r\n|\n|\r/gm;
	let startIndex:number = 0;

	for (; ;) {
		let result = re.exec(chunk);
		if (!result) {
			if (readerDone) {
				break;
			}
			let remainder = chunk.substr(startIndex);
			({ value: chunk8, done: readerDone } = await reader.read());
			chunk = remainder + (chunk8 ? utf8Decoder.decode(chunk8, { stream: true }) : "");
			startIndex = re.lastIndex = 0;
			continue;
		}
		yield chunk.substring(startIndex, result.index);
		startIndex = re.lastIndex;
	}
	if (startIndex < chunk.length) {
		// last line didn't end in a newline char
		yield chunk.substr(startIndex);
	}
}

let noQuotesRE = /\s*([^,]*),/;
let quotesRE = /\s*"(.*)?",/;
let matchOptionalQuotes = /\s*("*)(.*?)\1(,|$)/g;  // match 2 is our boy
const DefaultNameToTypeInitializer = {
	"date": "date",
	"id": "string",
	// ["date", "string"],
	"county": "string",
	"fips": "string",
	"place": "string",
	"name": "string",
	"note": "string"
};

class Converter {
	typeMap: any;
	names: [string,string][];

	constructor(header:string) {
		this.typeMap = {};
		this.names = []

		let splitees = header.split(',');
		let self = this;
		for (const name of splitees) {
			//console.log(name)
			let typer:string = DefaultNameToTypeInitializer[name] || 'number';
			self.typeMap[name] = typer;
			self.names.push([name, typer]);
		}
//		console.dir(this);
	}
	convertCol(value, colNum) {
		let self = this;
		let dataType = self.names[colNum][1];
		let name = self.names[colNum][0];
		switch (dataType) {
			case 'date':
				if (value.indexOf('T') == -1)
					value += 'T00:00:00.000';
				return new Date(value);

			case 'string':
				return value;

			case 'number':
				if (value === '')
					return null;
				try {
					return Number(value);
				} catch (e) {
					console.error(`While parsing column:'${name}', value:'${value}, caught:${e} `)
					return "null";
				}

			default:
				throw new Error(`Can't hydrate type ${dataType} for column ${name}`)
		}
	}
	convert(line) {
		let result = {};
		let matches = line.matchAll(matchOptionalQuotes);
		if (matches) {
			let col = 0
			for (let a of matches) {
				let name = this.names[col][0];
				let val = this.convertCol(a[2], col);
				result[name] = val;
				if (++col == this.names.length)
					break;
			}
		}
		// console.dir(`got result=${result}`)
		return result;
	}
}

async function getAllRows(readableStream:ReadableStream<Uint8Array>, rowTransformer:any): Promise<{ rowCount: number; rows: any[]; }> {
	let rows = [];
	let rowCount = 0;
	let converter;
	for await (let line of makeTextFileLineIterator(readableStream)) {
		if (!converter)
			converter = new Converter(line);
		else {
			let row = converter.convert(line);
			rowCount++;
			if (rowTransformer) {
				row = rowTransformer(row);
			}
			if (row)
				rows.push(row);
		}
	}
	return {
		rowCount: rowCount,
		rows: rows
	};
}

type ChunkType = {
	rowCount: number;
	rows: any[];
};
async function retrieveStream(uri: string, rowTransformer:any=null): Promise<ChunkType>{
	return new Promise((resolve, reject) => {
		console.log(`retrieve() calling fetch with uri=${uri}`);
		//const response = await fetch(uri, { responseType: 'stream', mode: 'no-cors'});
		//		fetch(uri, { mode: 'no-cors' })
		fetch(uri, { mode: 'cors' })
			.then((response:Response): ReadableStream<Uint8Array> => {
					if (!response.ok) {
						//console.dir(response);
						throw new Error("HTTP error, status = " + response.status);
					}
					return response.body;
				})
			.then(async function (readableStream:ReadableStream<Uint8Array>): Promise<void> {
				console.log('starting read')
				

				let chunks: ChunkType = await getAllRows(readableStream, rowTransformer);
				console.log('ending read')
				resolve(chunks);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

const URIBase =
  "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master";

function formUrl(filename) {
	return `${URIBase}/${filename}`
}

export async function retrieveCountyTotals(): Promise<CountyTotals> {
	const url = formUrl("cdph-county-cases-deaths.csv")

	const rv:CountyTotals = {
		recordCount: 0,
		countyToTotals: {}
	};
	const countyToTotals = rv.countyToTotals;

	let lineTransformer = (line) => {
		// console.log('transforming ' + JSON.stringify(line))
		if (!rv.countyToTotals[line.county])
			countyToTotals[line.county] = [];

		let rows = countyToTotals[line.county];
		let row = {
			date: line.date,
			confirmed_cases: line.reported_cases,
			deaths: line.reported_deaths,
			new_confirmed_cases: Number(0),
			new_deaths: Number(0),
		};
		rows.push(row);
	};
	const result =  await retrieveStream(url, lineTransformer);
	rv.recordCount = result.rowCount;
	console.log(`Retrieved ${rv.recordCount} CountyTotal rows`)

	return rv;
}

export async function retrievePlaceTotals(): Promise<PlaceTotals> {
	const url = formUrl("latimes-place-totals.csv")

	const rv:PlaceTotals = {
		recordCount: 0,
		countyToPlaceData: {}
	  };
	  let mapCountyToPlaceToRows = rv.countyToPlaceData;
  
	  let counter = 0;
	  let lineTransformer = (line) => {
  
		let places = mapCountyToPlaceToRows[line.county];
		if (!places) {
		  places = {};
		  mapCountyToPlaceToRows[line.county] = places;
		}
  
		let rows = places[line.name]
		if (!rows) {
		  rows = [];
		  places[line.name] = rows;
		}
  
		let row:PlaceDateTotal = {
		  date: line.date,
		  confirmed_cases: line.confirmed_cases,
		  new_confirmed_cases: Number(0),
	      population: line.population,
		};

		// if (++counter %10000 == 0)
		//   console.log(`Retrieved ${counter} rows`)
		rows.push(row);
	  };
	const result =  await retrieveStream(url, lineTransformer);
	rv.recordCount = result.rowCount;
	console.log(`Retrieved ${rv.recordCount} PlaceTotal rows`)
	
	return rv;
}
// async function retrieveAllAtOnce(uri) {
// 	return new Promise((resolve, reject) => {
// 		console.log(`retrieve() calling fetch with uri=${uri}`);
// 		//const response = await fetch(uri, { responseType: 'stream', mode: 'no-cors'});
// 		//		fetch(uri, { mode: 'no-cors' })
// 		fetch(uri, { mode: 'cors' })
// 			.then(function (response) {
// 				if (!response.ok) {
// 					console.dir(response)
// 					throw new Error("HTTP error, status = " + response.status);
// 				}
// 				return response.text();
// 			})
// 			.then(function (text) {
// 				resolve(text);
// 			})
// 			.catch((err) => {
// 				reject(err);
// 			});
// 	});
// }

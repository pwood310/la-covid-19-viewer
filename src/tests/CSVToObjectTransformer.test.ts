import { map } from 'lodash';
import React from 'react';
import { Exception } from 'sass';
import {Readable} from 'stream';
 
//import { render } from '@testing-library/react';
import {CSVToObjectTransformer} from '../lib/CSVToObjectTransformer';


describe("Retriever parsing", () => {

    test('transforms csv with new place file format', async () => {
        const transformer = new CSVToObjectTransformer();

        const input = `id,name,date,county,fips,confirmed_cases,note,population
94501,94501: Alameda,2021-02-21,Alameda,001,1950,,62826
94502,94502: Alameda,2021-02-21,Alameda,001,225,,14117
`;
        const result = await transformer.transform(input);

        expect(result.length).toBe(2)
        const alameda0 = result[0];
        expect(alameda0['county']).toBe("Alameda");
        expect(alameda0).toStrictEqual(
            {
                id: "94501",
                name: '94501: Alameda',
                date: new Date('2021-02-21T00:00:00.000'),
                county: 'Alameda',
                fips: '001',
                confirmed_cases: 1950,
                note: '',
                population: 62826
            }
        )
    });

    test('transforms csv to array of objects', async () => {
        const transformer = new CSVToObjectTransformer();
        const input = `date,county,fips,confirmed_cases,deaths,new_confirmed_cases,new_deaths
2020-09-18,Alameda,001,20364,370,202,5
2020-09-18,Los Angeles,037,258587,6330,1244,6
2020-09-18,Alpine,003,2,0,0,0
2020-01-26,Yolo,113,0,0,,
`
        const result = await transformer.transform(input);

        expect(result.length).toBe(4)
        const la = result[1];
        expect(la['county']).toBe("Los Angeles");
        expect(la).toStrictEqual(
            {
                "date": new Date("2020-09-18T00:00:00.000"),
                "county": "Los Angeles",
                "fips": "037",
                "confirmed_cases": 258587,
                "deaths": 6330,
                "new_confirmed_cases": 1244,
                "new_deaths": 6
            }
        );


        const yolo = result[3];
        expect(yolo['county']).toBe("Yolo");
        expect(yolo).toStrictEqual(
            {
                //"date": new Date("2020-01-26"),
                "date": new Date("2020-01-26T00:00:00.000"),
                "county": "Yolo",
                "fips": "113",
                "confirmed_cases": 0,
                "deaths": 0,
                "new_confirmed_cases": null,
                "new_deaths": null
            }
        );

        //    console.log(JSON.stringify(result))
    });


  test('Stream transformer', async () => {
    const transformer = new CSVToObjectTransformer();

    const stream = new Readable();
    stream._read = () => {}; // redundant? see update below
    stream.push(`id,name,date,county,fips,confirmed_cases,note,population
"95221, 95222","95221, 95222",2020-12-20,`);
stream.push(`Calaveras,009,77,,5029
City of Santa Monica,Santa Monica,2020-12-20,Los Angeles,037,2222,,92446
Unincorporated - Santa Monica Mountains,Santa Monica Mountains,2020-12-20,Los Angeles,037,261,,18621
`);
    stream.push(null);
    
    let mapCountyToPlaceToRows = {};
    

    const result = await transformer.transformStream(stream);

    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3)

    let row = result[0];
    expect(row['id']).toBe("95221, 95222");
    expect(row['date']).toEqual(new Date('2020-12-20T00:00:00.000'));
    
    // let simpleDate = new Date('2020-12-20');
    // let timeSpecDate = new Date('2020-12-20T00:00:00.000');
    // let timeSpecWithUtc = new Date('2020-12-20T00:00:00.000Z');

    // expect(simpleDate).toEqual(timeSpecWithUtc);
    // expect(simpleDate).toEqual(timeSpecDate);
     
    expect(row).toStrictEqual(
      { 
        "confirmed_cases": 77,
        "county": "Calaveras",
        "date": new Date('2020-12-20T00:00:00.000'),
        "fips": "009",
        "id": "95221, 95222",
        "name": "95221, 95222",
        "note": "",
        "population": 5029
      }
    );
    //    console.log(JSON.stringify(result))
  });

  test('Stream transformer with lineProcessor', async () => {
    const transformer = new CSVToObjectTransformer();

    const stream = new Readable();
    stream._read = () => {}; // redundant? see update below
    stream.push(`id,name,date,county,fips,confirmed_cases,note,population
"95221, 95222","95221, 95222",2020-12-20,`);
stream.push(`Calaveras,009,77,,5029
City of Santa Monica,Santa Monica,2020-12-20,Los Angeles,037,2222,,92446
Unincorporated - Santa Monica Mountains,Santa Monica Mountains,2020-12-20,Los Angeles,037,261,,18621
`);
    stream.push(null);
    
    let mapCountyToRows = {};
    


    let lineTransformer = (line) => {

      if (!line.county)
        throw new Error('where is the county!');

      let countyData: any;
      let placeData: Array<any>
      if ( line.county in mapCountyToRows) {
        countyData = mapCountyToRows[line.county];
      }
      else {
        countyData = {};
        mapCountyToRows[line.county] = countyData;
      }
      if ( line.id in countyData) {
        placeData = countyData[line.id];
      }
      else {
        placeData = [];
        countyData[line.id] = placeData;
      }

      let row = {
        date: line.date,
        confirmed_cases: line.confirmed_cases,
      };
      placeData.push(row);
    };


    const result = await transformer.transformStream(stream, lineTransformer);

    expect(result).not.toBeNull();
    expect(Array.isArray(result)).not.toBe(true);
    expect(result).toBe(3)

    let row = mapCountyToRows['Los Angeles']['City of Santa Monica'][0];
    console.dir(row);
    expect(row['confirmed_cases']).toBe(2222);
    expect(row['date']).toEqual(new Date('2020-12-20T00:00:00.000'));
    
    // let simpleDate = new Date('2020-12-20');
    // let timeSpecDate = new Date('2020-12-20T00:00:00.000');
    // let timeSpecWithUtc = new Date('2020-12-20T00:00:00.000Z');

    // expect(simpleDate).toEqual(timeSpecWithUtc);
    // expect(simpleDate).toEqual(timeSpecDate);
     
    expect(row).toStrictEqual(
      { 
        "confirmed_cases": 2222,  
        "date": new Date('2020-12-20T00:00:00.000'),
      }
    );
    //    console.log(JSON.stringify(result))
  });


});


import React from 'react';
//import { render } from '@testing-library/react';
import { CSVToObjectTransformer } from '../lib/CSVToObjectTransformer';

describe("Retriever parsing", () => {

  test('transforms csv to array of objects', async (done) => {
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
        "date": new Date("2020-09-18"),
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
        "date": new Date("2020-01-26"),
        "county": "Yolo",
        "fips": "113",
        "confirmed_cases": 0,
        "deaths": 0,
        "new_confirmed_cases": null,
        "new_deaths": null
      }
    );

    //    console.log(JSON.stringify(result))
    done()
  });

  test('optional column->type map is obeyed', async (done) => {
    const transformer = new CSVToObjectTransformer([['county', 'string'], ['date', 'date'], ['new_deaths', 'string']]);
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
        "date": new Date("2020-09-18"),
        "county": "Los Angeles",
        "fips": 37,
        "confirmed_cases": 258587,
        "deaths": 6330,
        "new_confirmed_cases": 1244,
        "new_deaths": "6"
      }
    );

    //    console.log(JSON.stringify(result))
    done()
  });


});


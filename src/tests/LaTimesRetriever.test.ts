import React from 'react';
//import { render } from '@testing-library/react';
import LaTimesRetriever from '../lib/LaTimesRetriever';

describe("Retriever parsing", () => {
  // test('retrieves the data I want', async (done) => {
  //   const retriever = new LaTimesRetriever("latimes-county-totals.csv");
  //   const result = await retriever.retrieve();
  //   expect("foo").toBe('foo')
  //   done()
  // });

  test('transforms csv to array of objects', async (done) => {
    const retriever = new LaTimesRetriever("something");
    const input = `date,county,fips,confirmed_cases,deaths,new_confirmed_cases,new_deaths
2020-09-18,Alameda,001,20364,370,202,5
2020-09-18,Los Angeles,037,258587,6330,1244,6
2020-09-18,Alpine,003,2,0,0,0
2020-01-26,Yolo,113,0,0,,
`
    const result = await retriever.transformCSVToObjects(input);
    console.log("here is result", result)
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

    console.log(JSON.stringify(result))
    done()
  });
});


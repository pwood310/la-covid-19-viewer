import React from 'react';
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
                date: '2021-02-21',
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
                //"date": new Date("2020-09-18"),
                "date": "2020-09-18",
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
                "date": "2020-01-26",
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

    test('optional column->type map is obeyed', async () => {
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
    });


});


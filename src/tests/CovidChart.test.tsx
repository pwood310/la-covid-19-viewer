import React from "react";
import { render, RenderResult } from "@testing-library/react";
import CovidChart from "../components/CovidChart";

//const axios = require('axios');
////jest.mock('axios');
const axios = null;

// https://dev.to/zaklaughton/the-only-3-steps-you-need-to-mock-an-api-call-in-jest-39mb

// import { CaliCountyTotalsCache } from "../lib/CaliCountyTotalsCache";
// import { IDataCache } from "../lib/IDataCache";

class CountyTotalsMockery {
  //implements IDataCache {
  delay: number;

  constructor(delay: number) {
    this.delay = delay;
  }

  get(refresh?: boolean): Promise<any[]> {
    if (this.delay == 0) {
      return Promise.resolve([
        {
          date: new Date("2020-09-18"),
          county: "Los Angeles",
          fips: "037",
          confirmed_cases: 258587,
          deaths: 6330,
          new_confirmed_cases: 1244,
          new_deaths: 6,
        },
      ]);
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              date: new Date("2020-09-18"),
              county: "Los Angeles",
              fips: "037",
              confirmed_cases: 258587,
              deaths: 6330,
              new_confirmed_cases: 1244,
              new_deaths: 6,
            },
          ]);
        }, this.delay * 1000);
      });
    }
  }
}

test("renders covid chart",  () => {
  axios.get.mockResolvedValue(
//    axios.get.mockReturnValueOnce(
{
    status: 200,
    statusText: 'OK',
    data: `date,county,fips,confirmed_cases,deaths,new_confirmed_cases,new_deaths
2020-12-24,Alameda,001,46583,619,1252,3
2020-12-24,Alpine,003,64,0,0,0
2020-12-24,Amador,005,2189,23,32,0
2020-12-24,Butte,007,6584,83,0,0
2020-12-24,Calaveras,009,754,22,0,0
2020-12-24,Colusa,011,1214,8,0,0
2020-12-24,Contra Costa,013,36752,308,439,0
2020-12-24,Del Norte,015,695,2,15,0
2020-12-24,El Dorado,017,5095,13,72,0
2020-12-24,Los Angeles,037,678040,9305,13004,140
2020-12-23,Los Angeles,037,665036,9165,16974,134
2020-12-22,Los Angeles,037,648062,9031,11872,96
2020-12-21,Los Angeles,037,636190,8935,12398,60
2020-12-20,Los Angeles,037,623792,8875,12885,53
2020-12-19,Los Angeles,037,610907,8822,13521,64
2020-12-18,Los Angeles,037,597386,8758,15867,87
2020-12-17,Los Angeles,037,581519,8671,14270,99
2020-12-16,Los Angeles,037,567249,8572,22469,134
2020-12-15,Los Angeles,037,544780,8438,11657,93
2020-12-14,Los Angeles,037,533123,8345,7559,47
2020-12-12,Los Angeles,037,513283,8273,11257,71
2020-12-11,Los Angeles,037,502026,8202,13507,51
2020-12-10,Los Angeles,037,488519,8151,12741,74
`
    // data: ""
});
 

  const chart:RenderResult = render(<CovidChart covidType="deaths" county="Los Angeles" />);
  
  const { getByText } = chart;
  const linkElement = getByText(/loading\.\.\./i);
  expect(linkElement).toBeInTheDocument();
});

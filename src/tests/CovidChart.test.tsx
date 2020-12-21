import React from "react";
import { render } from "@testing-library/react";
import CovidChart from "../components/CovidChart";
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

test("renders covid chart", () => {
  //const mock = new CountyTotalsMockery(0);

  debugger;
  const chart = render(<CovidChart covidType="deaths" county="Los Angeles" />);

  const { getByText } = chart;
  const linkElement = getByText(/highcharts/i);
  expect(linkElement).toBeInTheDocument();
});

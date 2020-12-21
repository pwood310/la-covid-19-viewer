import React from "react";
//import { render } from '@testing-library/react';
import * as LATimesChartUtils from "../lib/LATimesChartUtils";

describe("LATimesChartUtils Tests", () => {
  test("levelSortedData works without changing input objects", () => {
    const inputArray = [
      { date: "nomatte1", total_peeps: 0 },
      { date: "nomatte2", total_peeps: 30 },
      { date: "nomatte8", total_peeps: 25 },
      { date: "nomatte32", total_peeps: 35 },
      { date: "nomatter0", total_peeps: 0 },
    ];

    const result = LATimesChartUtils.levelSortedData(
      inputArray,
      "total_peeps",
      "_leveled"
    );
    expect(result[0]["total_peeps_leveled"]).toEqual(0);
    expect(result[1]["total_peeps_leveled"]).toEqual(30);
    expect(result[2]["total_peeps_leveled"]).toEqual(30);
    expect(result[3]["total_peeps_leveled"]).toEqual(35);
    expect(result[4]["total_peeps_leveled"]).toEqual(35);

    expect(inputArray).toStrictEqual([
      { date: "nomatte1", total_peeps: 0 },
      { date: "nomatte2", total_peeps: 30 },
      { date: "nomatte8", total_peeps: 25 },
      { date: "nomatte32", total_peeps: 35 },
      { date: "nomatter0", total_peeps: 0 },
    ]);

    expect(result).toEqual([
      { date: "nomatte1", total_peeps: 0, total_peeps_leveled: 0 },
      { date: "nomatte2", total_peeps: 30, total_peeps_leveled: 30 },
      { date: "nomatte8", total_peeps: 25, total_peeps_leveled: 30 },
      { date: "nomatte32", total_peeps: 35, total_peeps_leveled: 35 },
      { date: "nomatter0", total_peeps: 0, total_peeps_leveled: 35 },
    ]);
  });

  test("filterAndSortByDate with county only", () => {
    const inputArray = [
      { date: "2020-01-31", county: "Los Angeles", total_peeps: 0 },
      { date: "2020-12-03", county: "Los Angeles", total_peeps: 32 },
      { date: "2020-12-04", county: "Los Angeles", total_peeps: 0 },
      { date: "2020-12-03", county: "Los Cabos", total_peeps: 3 },
      { date: "2020-11-30", county: "Los Angeles", total_peeps: 20 },
      { date: "2020-12-02", county: "Los Gatos", total_peeps: 20 },
      { date: "2020-10-12", county: "Los Angeles", total_peeps: 23 },
    ];
  
    const result = LATimesChartUtils.filterAndSortByDate(
      inputArray,
      "Los Angeles",
      null,
      "total_peeps",
      true
    );
    expect(result).toEqual([
      {
        county: "Los Angeles",
        date: "2020-01-31",
        total_peeps: 0,
      },
      {
        county: "Los Angeles",
        date: "2020-10-12",
        total_peeps: 23,
      },
      {
        county: "Los Angeles",
        date: "2020-11-30",
        total_peeps: 23,
      },
      {
        county: "Los Angeles",
        date: "2020-12-03",
        total_peeps: 32,
      },
      {
        county: "Los Angeles",
        date: "2020-12-04",
        total_peeps: 32,
      },
    ]);
  });
});

import React from 'react';
//import { render } from '@testing-library/react';

import { CountyTotals, PlaceTotals } from '../lib/SimpleTypes';
import { retrieveCountyTotals, retrievePlaceTotals } from '../lib/LATimesRetriever2';
import * as retriever from '../lib/LATimesRetriever2'
jest.setTimeout(25000);

console.dir(fetch);


describe("LATimesRetriever Streaming Tests", () => {
  test('retrieves CountyTotals as Stream', async () => {
    let result: CountyTotals = await retrieveCountyTotals();
    expect(result).toBeTruthy();
    expect(result.recordCount).toBeGreaterThanOrEqual(11100);

  });


  test('retrieves PlaceTotals as Stream', async () => {
    let result: PlaceTotals = await retriever.retrievePlaceTotals();
    expect(result).toBeTruthy();
    expect(result.recordCount).toBeGreaterThanOrEqual(409427);
  });

  // beforeEach(() => {
  //   jest.spyOn(console, 'error').mockImplementation(() => {});
  // });

  // test('returns error when axios fails to retrieve', async () => {



  //   try {
  //     let result: any = await retriever.("NothingDoing");
  //   }
  //   catch (e) {
  //     expect(e.toString()).toMatch(/status code 404/i);
  //   }
  // });
});


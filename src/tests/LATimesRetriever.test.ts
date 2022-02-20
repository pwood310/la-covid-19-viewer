import React from 'react';
//import { render } from '@testing-library/react';
import {LATimesRetriever} from '../lib/LATimesRetriever';
import { PlaceTotals, CountyTotals } from "../lib/SimpleTypes";


describe("LATimesRetriever Tests", () => {
  test('retrieves CountyTotals', async () => {
    const retriever = new LATimesRetriever();
    let result: CountyTotals = await retriever.retrieveCountyTotals();
    expect(result).toBeTruthy();
    expect(result.recordCount).toBeGreaterThanOrEqual(11100);

  });

  test('retrieves PlaceTotals', async () => {
    const retriever = new LATimesRetriever();
    let result: PlaceTotals = await retriever.retrievePlaceTotals();
    expect(result).toBeTruthy();
    expect(result.recordCount).toBeGreaterThanOrEqual(409427);
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  test('returns error when axios fails to retrieve', async () => {

    
    const retriever = new LATimesRetriever();

    try {
      let result: string = await retriever.retrieve("NothingDoing");
    }
    catch (e) {
      expect(e.toString()).toMatch(/status code 404/i);
    }
  });
});


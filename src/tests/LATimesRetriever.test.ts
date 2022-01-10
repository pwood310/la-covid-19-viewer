import React from 'react';
//import { render } from '@testing-library/react';
import {LATimesRetriever, PlaceTotals, CountyTotals} from '../lib/LATimesRetriever';

jest.setTimeout(25000 );
  

describe("LATimesRetriever Streaming Tests", () => {
  test('retrieves CountyTotals as Stream', async () => {
    const retriever = new LATimesRetriever();
    let result: CountyTotals = await retriever.retrieveCountyTotals();
    expect(result).toBeTruthy();
    expect(result.recordCount).toBeGreaterThanOrEqual(11100);

  });


  test('retrieves PlaceTotals as Stream', async () => {
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
      let result: any = await retriever.retrieveAsStream("NothingDoing");
    }
    catch (e) {
      expect(e.toString()).toMatch(/status code 404/i);
    }
  });
});


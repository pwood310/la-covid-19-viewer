import React from 'react';
//import { render } from '@testing-library/react';
import { LATimesRetriever } from '../lib/LATimesRetriever';

describe("LATimesRetriever Tests", () => {
  test('retrieves the data I want', async (done) => {
    const retriever = new LATimesRetriever("latimes-county-totals.csv");
    let result = await retriever.retrieve();
    expect(result).toBeTruthy();

   expect(result.length).toBeGreaterThanOrEqual(11100);

   done();
  });

});


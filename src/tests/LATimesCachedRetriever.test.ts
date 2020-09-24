import React from 'react';
//import { render } from '@testing-library/react';
import { LATimesCachedRetriever } from '../lib/LATimesCachedRetriever';

describe("Retriever parsing", () => {
  test('retrieves the data I want multiple times', async (done) => {
    const retriever = new LATimesCachedRetriever("latimes-county-totals.csv");
    let result = await retriever.retrieve();
    expect(result).toBeTruthy();

    expect(result.length).toBeGreaterThanOrEqual(11100);

    result = await retriever.retrieve();
    expect(result.length).toBeGreaterThanOrEqual(11100);
    done()
  });

});


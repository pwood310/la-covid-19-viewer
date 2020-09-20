import React from 'react';
//import { render } from '@testing-library/react';
import { CaliCountyTotalsCache } from '../lib/CaliCountyTotalsCache';

describe("Retriever parsing", () => {
  test('retrieves the data I want multiple times', async (done) => {
    const cache = new CaliCountyTotalsCache();
    const result = await cache.get();
    expect(result).toBeTruthy();

    expect(result.length).toBeGreaterThanOrEqual(11100);

    const result2 = await cache.get();
    expect(result.length).toBeGreaterThanOrEqual(11100);
    done()
  });

});


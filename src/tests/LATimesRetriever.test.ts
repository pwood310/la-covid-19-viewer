import React from 'react';
//import { render } from '@testing-library/react';
import LATimesRetriever from '../lib/LATimesRetriever';

describe("Retriever parsing", () => {
   test('retrieves the data I want multiple times', async (done) => {
     const retriever = new LATimesRetriever("latimes-county-totals.csv");
     const result = await retriever.retrieve();
     expect(result).toBeTruthy();

     expect(result.length).toBeGreaterThanOrEqual(11100);

     const result2 = await retriever.retrieve();
     expect(result.length).toBeGreaterThanOrEqual(11100);
     done()
   });

});


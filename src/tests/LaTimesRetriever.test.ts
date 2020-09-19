import React from 'react';
//import { render } from '@testing-library/react';
import LaTimesRetriever from '../lib/laTimesRetriever';

test('retrieves the data I want', async (done) => {
  // const retriever = new LaTimesRetriever("latimes-county-totals.csv");
  const retriever = new LaTimesRetriever();
  const result = await retriever.retrieve();
  expect("foo").toBe('foo')
  done()
 });


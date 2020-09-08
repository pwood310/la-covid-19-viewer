// jshint esversion: 6

import React from "react";
import { CovidChart } from "./CovidChart";
import Footer from "./Footer";
import "../App.css";

const App = () => (
  <div>
    <header className="App-header">
      <h1 >LA County COVID-19</h1>
    </header>

    <div className="container5">
      <CovidChart covidType="confirmedCases" />
      {/* <button id="toggle-type" class="autocompare">Type</button> */}
    </div>

    <div className="container5b">
      <CovidChart covidType="deaths" />
      {/* <button id="toggle-type" class="autocompare">Type</button> */}
    </div>
    <div>
      <Footer/>
    </div>
  </div>
);

export default App;

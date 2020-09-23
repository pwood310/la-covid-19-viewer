// jshint esversion: 6

import React from "react";
import CovidChart from "./CovidChart";
import Footer from "./Footer";
// import ChartChooser from "./ChartChooser";
import ChartChooserWithTabs from "./ChartChooserWithTabs";
import "../App.css";
import { CaliCountyTotalsCache } from "../lib/CaliCountyTotalsCache";

const App = () => {
  // function onChoice(mapType) {
  //   console.log("chose ", mapType);
  // }
  console.log('app redrawing')
  const caliTotalsCache = new CaliCountyTotalsCache();
  const confirmedChart = (
    <CovidChart covidType="confirmed_cases" dataSource={caliTotalsCache} />
  );
  const deathsChart = (
    <CovidChart covidType="deaths" dataSource={caliTotalsCache} />
  );

  return (
    <div>
      <header className="App-header">
        <h1>LA County COVID-19</h1>
      </header>

      <div className="AAAAAAcontainer5">
        <ChartChooserWithTabs
          confirmedChart={confirmedChart}
          deathsChart={deathsChart}
        />
      </div>
      {/* <div className="container5">
        <CovidChart covidType="confirmed_cases" />
      </div>

      <div className="container5b">
        <CovidChart covidType="deaths" />
      </div> */}

      <div>
        <Footer />
      </div>
    </div>
  );
};

export default App;

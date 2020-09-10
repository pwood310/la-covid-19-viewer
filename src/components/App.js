// jshint esversion: 6

import React from "react";
import CovidChart from "./CovidChart";
import Footer from "./Footer";
// import ChartChooser from "./ChartChooser";
import ChartChooserWithTabs from "./ChartChooserWithTabs";
import "../App.css";

const App = () => {
  // function onChoice(mapType) {
  //   console.log("chose ", mapType);
  // }
  const confirmedChart =  <CovidChart covidType="confirmedCases" />
  const deathsChart =  <CovidChart covidType="deaths" />

  return (
    <div>
      <header className="App-header">
        <h1>LA County COVID-19</h1>
      </header>

      <div className="AAAAAAcontainer5">
        <ChartChooserWithTabs confirmedChart={confirmedChart} deathsChart={deathsChart} />
      </div>
      {/* <div className="container5">
        <CovidChart covidType="confirmedCases" />
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

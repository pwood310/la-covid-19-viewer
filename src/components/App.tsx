// jshint esversion: 6

import React from "react";
import CovidChart from "./CovidChart";
import Header from "./Header";
import Footer from "./Footer";
import "./App.scss";

import CountySelector from "./CountySelector";
import PlaceSelector from "./PlaceSelector";
import CovidChartPlace from "./CovidChartPlace";
//import CovidChartOld from "./CovidChartOld";

const App = () => {
  const [county, setCounty] = React.useState("Los Angeles");
  const [place, setPlace] = React.useState("Santa Monica");

  console.log("app redrawing");

  // const onCountyChange = (newCounty: string) => {
  //   setCounty(newCounty);
  // };

  console.log("county is", county);
  return (
    <div>
      <Header />
      <CountySelector defaultCounty={county} onChange={setCounty} />
      <CovidChart covidType="confirmed_cases" county={county} />
      <CovidChart covidType="deaths" county={county} />

      <div className="placeGroup">
        <PlaceSelector
          county={county}
          defaultPlace={""}
          onChange={setPlace}
        />

        <CovidChartPlace county={county} place={place} />
      </div>
      <Footer />
    </div>
  );
};

export default App;

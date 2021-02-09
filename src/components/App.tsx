// jshint esversion: 6

import React from "react";
import CovidChart from "./CovidChart";
import Header from "./Header";
import Footer from "./Footer";
import "./App.scss";

import CountySelector from "./CountySelector";
import PlaceSelector from "./PlaceSelector";

const App = (): JSX.Element => {
  const [county, setCounty] = React.useState("Los Angeles");
  //const [countyToPlace, setCountyToPlace] = React.useState({ "Los Angeles": "Santa Monica" });

  console.debug(`app redrawing with county=${county}`);

  // const onCountyChange = (newCounty: string) => {
  //   setCounty(newCounty);
  // };

  // const handlePlaceChange = (place: string) => {
  //  if (county && place)
  //     setCountyToPlace({
  //       ...countyToPlace,
  //       [county]: place
  //     });
  // };

  //const place: string = countyToPlace[county] || "";

  //console.log('using place', place)

  return (
    <div>
      <Header />
      <CountySelector defaultCounty={county} onChange={setCounty} />
      <CovidChart covidType="confirmed_cases" county={county} />
      <CovidChart covidType="deaths" county={county} />

      <div className="placeGroup">
        <PlaceSelector
          county={county}
        />
      </div>
      <Footer />
    </div>
  );
};

export default App;

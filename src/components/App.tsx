// jshint esversion: 6

import React from "react";
import CovidChart from "./CovidChart";
import Footer from "./Footer";
import "../App.css";
import LACountySelector from "./LACountySelector";
import PlaceSelector from "./PlaceSelector";
import CovidChartPlace from "./CovidChartPlace";

const App = () => {
  const [county, setCounty] = React.useState("Los Angeles");
  const [place, setPlace] = React.useState("Santa Monica");

  console.log("app redrawing");
  
  // const onCountyChange = (newCounty: string) => {
  //   setCounty(newCounty);
  // };

  console.log("county is now", county);
  return (
    <div>
      <header className="App-header">
        <h1>California COVID-19</h1>
      </header>

      <LACountySelector defaultCounty={county} onChange={setCounty} />
      
      <div className="nothin">
        <div className="container5">
          <CovidChart covidType="confirmed_cases" county={county} />
        </div>
        <div className="container5">
          <CovidChart covidType="deaths" county={county} />
        </div>
      </div>
      
      <div className="container5">
      <PlaceSelector county={county} defaultPlace={place} onChange={setPlace} />
      </div>
    
      <div>
      <CovidChartPlace covidType="confirmed_cases" county={county} place={place}/>
     </div>
      
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default App;

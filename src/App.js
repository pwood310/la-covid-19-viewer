// jshint esversion: 6
import React from 'react';
// import { render } from 'react-dom';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { CovidChart } from './CovidChart';
//import moment from 'moment';
import _ from 'lodash';

import logo from './logo.svg';
import './App.css';

import rawData from './data/rawData.json';

function createDifferentialRunningAverages(arrayOfObj, labelName, daysInAverage) {

  let arrAvg = (arr) => {
    if (!arr.length)
      return 0;

    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum / arr.length;
  }

  let differenceArray = arrayOfObj.map((item, index, arr) => { return index == 0 ? item[labelName] : item[labelName] - arr[index - 1][labelName] });
  let averages = differenceArray.map((_item, index, arr) => { return arrAvg(arr.slice(Math.max(0, index - daysInAverage), index + 1)) });

  let answer = [];

  for (let i = 0; i < averages.length; i++) {
    let item = { date: new Date(arrayOfObj[i].date).valueOf() };
    item[labelName] = averages[i];
    answer.push(item);
  }
  return answer;
}

console.log('calling cDRA');

const deathSeriesDailyData = createDifferentialRunningAverages(rawData, 'deaths', 3);

const deathSeriesData = [];
const confirmedSeriesData = [];
const confirmedDailyIncreaseData = [];
const doublingRateDaysData = [];



for (let idx = 0; idx < rawData.length; idx++) {
  const dateEpoch = new Date(rawData[idx].date).valueOf();
  confirmedSeriesData.push({ x: dateEpoch, y: rawData[idx].confirmedCases });

  let yesterday = idx === 0 ? 0 : rawData[idx - 1].confirmedCases;
  let today = rawData[idx].confirmedCases;


  let doublingDaysRate;
  if (yesterday === 0 || today === 0)
    doublingDaysRate = 0;
  else
    doublingDaysRate = 1.0 / Math.log2(today / yesterday);

  doublingRateDaysData.push({
    x: dateEpoch, y: doublingDaysRate
  });

  confirmedDailyIncreaseData.push({
    x: dateEpoch, y: today - yesterday
  });

  deathSeriesData.push({
    x: dateEpoch, y: deathSeriesDailyData[idx].deaths
  });

}

console.log('DEATH1', deathSeriesDailyData)
console.log('DEATH', deathSeriesData)

const options = {
  chart: {
    type: 'spline'
  },
  title: {
    text: 'Los Angeles COVID-19 2020'
  },
  xAxis: {
    type: 'datetime'
  },

  yAxis: {
    type: 'linear',
    //minorTickInterval: 0.1,
    // accessibility: {
    //   rangeDescription: 'Range: 0.1 to 1000'
    // }
  },

  series: [{
    name: 'Confirmed Cases',
    data: confirmedSeriesData
  },
  {
    name: 'Confirmed Cases Daily Increase',
    data: confirmedDailyIncreaseData
  },
  {
    name: 'Days Needed to Double Confirmed Cases',
    data: doublingRateDaysData
  },
  {
    name: 'Deaths',
    data: deathSeriesData,
    id: 'deaths'
  },
  ]

};
options.series.shift();
options.series.shift();
options.series.shift();

const App = () => <div>
  <div className="container4">
    <p>
      <h1>LA County COVID-19</h1>
    </p>
  </div>

  <div >
    <CovidChart
      covidType='confirmedCases'
      initScaleAsLog='true'
    />
    {/* <button id="toggle-type" class="autocompare">Type</button> */}
  </div>

  <div>
    <CovidChart
    covidType='deaths'
    initScaleAsLog='false'
    />
    {/* <button id="toggle-type" class="autocompare">Type</button> */}
  </div>


</div>

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;

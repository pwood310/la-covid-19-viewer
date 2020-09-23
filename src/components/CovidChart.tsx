// import { render } from 'react-dom';
import React, { useState, useEffect } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import _ from "lodash";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

//import {CaliCountyTotalsCache} from "../lib/CaliCountyTotalsCache";
import { IDataCache } from "../lib/IDataCache";
//import {CSVToObjectTransformer } from "../lib/CSVToObjectTransformer";

Highcharts.setOptions({
  lang: {
    thousandsSep: ",",
  },
});

const useStyles = (theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
});

function snakeToPascal(s: string) {
  if (!s || typeof s != "string") return s;

  s = capitalizeFirstLetter(s);

  let idx = s.indexOf("_");
  while (idx != -1) {
    s = s.slice(0, idx) + capitalizeFirstLetter(s.slice(idx + 1));
    idx = s.indexOf("_");
  }
  return s;
}

function capitalizeFirstLetter(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

type Props = {
  dataSource: IDataCache;
  covidType: string;
};

interface IState {
  cumulativeScale: any;
  rawData: any[];
  hoverData: any;
}

function extractDifferenceArray(rawDataArray, labelName) {
  return rawDataArray.map((item, index, arr) => {
    return index === 0
      ? item[labelName]
      : item[labelName] - arr[index - 1][labelName];
  });
}

function createDifferentialRunningAverages(
  arrayOfObj: any[],
  labelName: string
) {
  let arrAvg = (arr) => {
    if (!arr.length) return 0;

    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum / arr.length;
  };

  let differenceArray = extractDifferenceArray(arrayOfObj, labelName);
  let cumulativeArray = [];
  for (let total = 0, i = 0; i < differenceArray.length; i++) {
    total += differenceArray[i];
    cumulativeArray.push(total);
  }

  let daysInAverage = 7;
  let averagesArray = differenceArray.map((_item, index, arr) => {
    return arrAvg(arr.slice(Math.max(0, index + 1 - daysInAverage), index + 1));
  });

  let avgValues = [];
  let dailyValues = [];
  let cumulativeValues = [];
  for (let i = 0; i < averagesArray.length; i++) {
    let date = new Date(arrayOfObj[i].date).valueOf();

    let dailyItem = { x: date, y: differenceArray[i] };
    let avgItem = { x: date, y: averagesArray[i] };
    let cumulativeItem = { x: date, y: cumulativeArray[i] };

    dailyValues.push(dailyItem);
    avgValues.push(avgItem);
    cumulativeValues.push(cumulativeItem);
  }
  return { dailyValues, avgValues, cumulativeValues };
}

function setSeriesData(state: IState, props: Props, chartOptions: any) {
  chartOptions.series = null;
  //console.log(chartOptions);

  let {
    dailyValues,
    avgValues,
    cumulativeValues,
  } = createDifferentialRunningAverages(state.rawData, props.covidType);

  chartOptions.series = [
    {
      yAxis: 0,
      name: "Daily",
      data: dailyValues,
      type: "column",
    },
  ];

  chartOptions.series.push({
    yAxis: 1,
    name: "Cumulative",
    data: cumulativeValues,
    type: "spline",
  });

  chartOptions.series.push({
    yAxis: 0,
    name: "7-Day Moving Average",
    data: avgValues,
    type: "spline",
  });
}

function fullyPopulateChartInfo(state: IState, props: Props): any {
  const chartOptions = createChartOptions(state, props);
  setSeriesData(state, props, chartOptions);
  return chartOptions;
}

function createChartOptions(state: IState, props: Props): any {
  //this.caliCountyTotalsCache = new CaliCountyTotalsCache();
  // props: covidType: [ deaths, confirmed_cases ]
  //        initScaleAsLog: [ true, false ]

  //console.log("props=", props);
  return {
    chart: {
      type: "spline",
      renderTo: "container",
      // animation: false,
      spacingTop: 0,
      spacingRight: 0,
      spacingBottom: 0,
      spacingLeft: 0,
      // plotBorderWidth: 0,
      //  margin: [0,0,85,85]
    },
    title: {
      text: snakeToPascal(props.covidType),
    },
    xAxis: {
      type: "datetime",
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y:,.0f}</b><br/>",
      shared: true,
    },
    lang: {
      decimalPoint: ".",
      thousandsSep: ",",
    },

    yAxis: [
      {
        // Primary yAxis
        type: "linear",
        labels: {
          format: "{value}",
          style: {
            // color: Highcharts.getOptions().colors[1]
          },
        },
        title: {
          text: "Daily",
          style: {
            //   color: Highcharts.getOptions().colors[2]
            // fontSize: "8px"
          },
        },

        //minorTickInterval: 0.1,
        // accessibility: {
        //   rangeDescription: 'Range: 0.1 to 1000'
        // }
        opposite: false,
      },
      {
        // Secondary yAxis
        type: state.cumulativeScale,
        labels: {
          format: "{value}",
          style: {
            //   color: Highcharts.getOptions().colors[0]
          },
        },
        title: {
          text: "Cumulative",
          style: {
            //  color: Highcharts.getOptions().colors[0]
            //     fontSize: "8px"
          },
        },
        opposite: true,
      },
      {
        // Secondary yAxis
        type: "linear",
        labels: {
          format: "{value}",
          style: {
            //   color: Highcharts.getOptions().colors[0]
          },
        },
        title: {
          text: "7-Day Moving Average",
          style: {
            //  color: Highcharts.getOptions().colors[0]
          },
        },
        opposite: false,
      },
    ],
    plotOptions: {
      series: {
        point: {
          events: {
            mouseOver: null, //setHoverData.bind(this),
          },
        },
      },
    },
  };
}

function CovidChart(props: Props): any {
  const [state, setState] = useState<IState>({
    cumulativeScale: "linear",
    hoverData: null,
    rawData: [],
  });

  console.log(`CovidChart: right before useEffect: ${props.covidType}`);

  useEffect(() => {
    console.log("useEffect called");
    props.dataSource
      .get()
      .then((rows) => {
        return rows
          .filter((item) => item.county == "Los Angeles")
          .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      })
      .then((filteredRows) => {
        console.log(
          `useEffect: filteredRows # ${filteredRows && filteredRows.length}`
        );
        const newState = { ...state };
        newState.rawData = filteredRows;
        console.log("useEffect: setState");

        setState(newState);
      });
  }, []);

  function setHoverData(e) {
    // The chart is not updated because `chartOptions` has not changed.
    //this.setState({ hoverData: e.target.category });
    const newState = { ...state, hoverData: e.target.id };
    console.log("setHoverData: setState");
    setState(newState);
  }

  function getToggledScaleName(scaleName: string) {
    return scaleName === "logarithmic" ? "linear" : "logarithmic";
  }

  function toggleCumulativeScale() {
    //  The chart is updated only with new options.
    // let newScalingType = getToggledScaleName(state.chartOptions.yAxis[1].type);
    let newScalingType = getToggledScaleName(state.cumulativeScale);

    let newState = { ...state, cumulativeScale: newScalingType };

    console.log("toggleCumulativeScale: setState");
    setState(newState);
  }

  console.log("CovidChart returning the new stuff");
  // const { chartOptions, hoverData } = this.state;

  const chartOptions = fullyPopulateChartInfo(state, props);

  return (
    <div className="OUTOUTOUTcontaikner5">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      {/* <h3>Hovering over {hoverData}</h3> */}
      <Button
        onClick={toggleCumulativeScale.bind(this)}
        variant="outlined"
        color="primary"
        size="small"
      >
        {/* Cumulative Scale: {this.state.chartOptions.yAxis[1].type} */}
        Toggle Cumulative Scale
      </Button>
    </div>
  );
}

export default withStyles(useStyles)(CovidChart);

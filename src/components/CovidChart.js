// import { render } from 'react-dom';
import React, { Component } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import _ from "lodash";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

import rawData from "../data/rawData.json";

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

function capitalizeFirstLetter(s) {
  if (!s || typeof s != "string") return s;
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

class CovidChart extends Component {
  extractDifferenceArray(rawDataArray, labelName) {
    return rawDataArray.map((item, index, arr) => {
      return index === 0
        ? item[labelName]
        : item[labelName] - arr[index - 1][labelName];
    });
  }

  createDifferentialRunningAverages(arrayOfObj, labelName) {
    let arrAvg = (arr) => {
      if (!arr.length) return 0;

      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      return sum / arr.length;
    };

    let differenceArray = this.extractDifferenceArray(arrayOfObj, labelName);
    let cumulativeArray = [];
    for (let total = 0, i = 0; i < differenceArray.length; i++) {
      total += differenceArray[i];
      cumulativeArray.push(total);
    }

    let daysInAverage = 7;
    let averagesArray = differenceArray.map((_item, index, arr) => {
      return arrAvg(
        arr.slice(Math.max(0, index + 1 - daysInAverage), index + 1)
      );
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

  setSeriesData(chartOptions) {
    chartOptions.series = null;
    //console.log(chartOptions);

    let {
      dailyValues,
      avgValues,
      cumulativeValues,
    } = this.createDifferentialRunningAverages(rawData, this.props.covidType);
    chartOptions.series = [
      {
        yAxis: 0,
        name: "Daily",
        data: dailyValues,
        type: "column",
        // lang: {
        //     thousandsSep: ','
        // }
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

  constructor(props) {
    super(props);

    // props: covidType: [ deaths, confirmedCases ]
    //        initScaleAsLog: [ true, false ]

    //console.log("props=", props);
    
    this.state = {
      // To avoid unnecessary update keep all options in the state.
      chartOptions: {
        chart: {
          type: "spline",
        },
        title: {
          text: capitalizeFirstLetter(this.props.covidType),
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
            type: "linear",
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
                mouseOver: this.setHoverData.bind(this),
              },
            },
          },
        },
      },
      hoverData: null,
    };
  }

  setHoverData = (e) => {
    // The chart is not updated because `chartOptions` has not changed.
    //this.setState({ hoverData: e.target.category });
    this.setState({ hoverData: e.target.id });
  };

  toggleCumulativeScale = () => {
    //  The chart is updated only with new options.
    let newScalingType =
      this.state.chartOptions.yAxis[1].type === "logarithmic"
        ? "linear"
        : "logarithmic";
    let newState = _.cloneDeep(this.state);
    newState.chartOptions.yAxis[1].type = newScalingType;
    this.setState(newState);
  };

  

  render() {
    //console.log("render called");
    const { chartOptions, hoverData } = this.state;
    this.setSeriesData(chartOptions);

    return (
      <div>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        {/* <h3>Hovering over {hoverData}</h3> */}
        <Button onClick={this.toggleCumulativeScale.bind(this)} variant="contained" color="Primary" >
          Toggle Cumulative Scale
        </Button>
      </div>
    );
  }
}

export default withStyles(useStyles)(CovidChart)

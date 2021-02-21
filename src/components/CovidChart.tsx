// import { render } from 'react-dom';
import React, { useState, useMemo } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
//import _ from "lodash";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useQuery } from "react-query";

import "./CovidChart.css";

import {
  LATimesRetriever,
  CountyTotalsType,
} from "../lib/LATimesRetriever";
//import { fullyPopulateChartInfo, filterAndSortByDate } from "../lib/LATimesChartUtils";
import {
  ChartDailyRowInput,
  ChartDailyRow,
  extractWorkingData,
  fullyPopulateChartInfo,
  snakeToPascal,
} from "../lib/LATimesChartUtils";

const useStyles = (theme: any) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
});

type Props = {
  county: string;
  covidType: string;
};

interface IState {
  cumulativeScale: string;
  dailyScale: string;
  hoverData: any;
}

function CovidChart(props: Props): any {
  const [state, setState] = useState<IState>({
    cumulativeScale: "linear",
    dailyScale: "linear",
    hoverData: null,
  });

  const { county, covidType } = props;

  function retrieve(): () => Promise<CountyTotalsType[]> {
    const retriever = new LATimesRetriever();
    return async () => {
      return await retriever.retrieveCountyTotals();
    };
  }

  const { isLoading, isError, data, error } = useQuery<CountyTotalsType[], any>(
    "countyTotals",
    retrieve(),
    {
      staleTime: 2 * 3600 * 1000,
      retry: 2,
    }
  );

  const filteredData: ChartDailyRowInput[] = useMemo(() => {
    if (!data || !data.length) return [];
    return data
      .filter((item) => item.county === county)
      .map((row: CountyTotalsType) => {
        return {
          date: row.date,
          rawCumulative:
            covidType === "deaths" ? row.deaths : row.confirmed_cases,
          rawDaily:
            covidType === "deaths" ? row.new_deaths : row.new_confirmed_cases,
        };
      });
  }, [data, county, covidType]);

  //console.log("RawData", rawData);

  const dataReadyForCharting: ChartDailyRow[] = useMemo(
    () => extractWorkingData(filteredData, true, false, 7),
    [filteredData]
  );

  const memoizedChartOptions = useMemo(
    () =>
      fullyPopulateChartInfo(
        dataReadyForCharting,
        county + " County - " + snakeToPascal(covidType),
        state.cumulativeScale,
        state.dailyScale
      ),
    [
      dataReadyForCharting,
      county,
      covidType,
      state.cumulativeScale,
      state.dailyScale,
    ]
  );

  //console.log("Memoizedchartoptions", memoizedChartOptions);

  if (isError || error) {
    return <span>Error: {error.message}</span>;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  // function setHoverData(e) {
  //   // The chart is not updated because `chartOptions` has not changed.
  //   //this.setState({ hoverData: e.target.category });
  //   const newState = { ...state, hoverData: e.target.id };
  //   console.log("setHoverData: setState");
  //   setState(newState);
  // }

  function getToggledScaleName(scaleName: string) {
    return scaleName === "logarithmic" ? "linear" : "logarithmic";
  }

  function toggleCumulativeScale() {
    let newScalingType = getToggledScaleName(state.cumulativeScale);

    let newState = { ...state, cumulativeScale: newScalingType };

    console.debug("toggleCumulativeScale: setState to", newScalingType);
    setState(newState);
  }

  function toggleDailyScale() {
    const newScalingType = getToggledScaleName(state.dailyScale);

    const newState = { ...state, dailyScale: newScalingType };

    console.debug("toggleDailyScale: setState to", newScalingType);
    setState(newState);
  }

  console.debug(`CovidChart redrawing for ${covidType}, ${county}`);

  return (
    <div className="CovidChart">
      <HighchartsReact highcharts={Highcharts} options={memoizedChartOptions} />
      {/* <h3>Hovering over {hoverData}</h3> */}
      <Button
        onClick={toggleDailyScale.bind(this)}
        variant="outlined"
        color="primary"
        size="small"
      >
        Avg/Daily Scales: {state.dailyScale}
      </Button>
      <Button
          onClick={toggleCumulativeScale.bind(this)}
          variant="outlined"
          color="primary"
          size="small"
      >
        {/* Cumulative Scale: {this.state.chartOptions.yAxis[1].type} */}
        Cumulative Scale: {state.cumulativeScale}
      </Button>


    </div>
  );
}

export default withStyles(useStyles)(CovidChart);

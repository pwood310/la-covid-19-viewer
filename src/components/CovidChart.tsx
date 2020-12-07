// import { render } from 'react-dom';
import React, { useState, useMemo } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
//import _ from "lodash";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useQuery } from "react-query";

import "./CovidChart.css";

import { LATimesRetriever, BaseTotalsType, CountyTotalsType } from "../lib/LATimesRetriever";
import { fullyPopulateChartInfo, filterAndSortByDate } from "../lib/LATimesChartUtils";

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

type Props = {
  county: string;
  covidType: string;
};

interface IState {
  cumulativeScale: any;
  hoverData: any;
}

function CovidChart(props: Props): any {
  const [state, setState] = useState<IState>({
    cumulativeScale: "linear",
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
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  const rawData = useMemo(
    () => filterAndSortByDate(data, county, '', covidType, true),
    [data, county, covidType]
  );

  //console.log("RawData", rawData);


  const memoizedChartOptions = useMemo(
    () => fullyPopulateChartInfo(rawData, county, '', covidType, state.cumulativeScale),
    [rawData, county, covidType, state.cumulativeScale]
  );

  //console.log("Memoizedchartoptions", memoizedChartOptions);

  if (isError || error) {
    return <span>Error: {error.message}</span>;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

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
    console.log('boo')
    let newScalingType = getToggledScaleName(state.cumulativeScale);

    let newState = { ...state, cumulativeScale: newScalingType };

    console.log("toggleCumulativeScale: setState to", newScalingType);
    setState(newState);
  }

  console.log(`CovidChart redrawing for ${covidType}, ${county}`);

  return (
    <div className="CovidChart">
      <HighchartsReact highcharts={Highcharts} options={memoizedChartOptions} />
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

// import { render } from 'react-dom';
import React, { useState, useMemo } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
//import _ from "lodash";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useQuery } from "react-query";

import "./CovidChartPlace.css";

import { LATimesRetriever, BaseTotalsType } from "../lib/LATimesRetriever";
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
  place: string;
  covidType: string;
};

interface IState {
  cumulativeScale: any;
  hoverData: any;
}

function CovidChartPlace(props: Props): any {
  const [state, setState] = useState<IState>({
    cumulativeScale: "linear",
    hoverData: null,
  });

  const { county, place, covidType } = props;

  function retrieve(): () => Promise<BaseTotalsType[]> {
    const retriever = new LATimesRetriever();
    return async () => {
      return await retriever.retrievePlaceTotals();
    };
  }

  const { isLoading, isError, data, error } = useQuery<BaseTotalsType[], any>(
    "placeTotals",
    retrieve(),
    {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  const rawData = useMemo(
    () => filterAndSortByDate(data, county, place, covidType, true),
    [data, county, place, covidType]
  );

  const memoizedChartOptions = useMemo(
    () => fullyPopulateChartInfo(rawData, county, place, covidType, state.cumulativeScale),
    [rawData, county, place, covidType, state.cumulativeScale]
  );

  if (isError || error) {
    return <span>Error: {error.message}</span>;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!rawData || !rawData.length) {
    let style = {textAlign: "center"};
   
    return (
      <p style={{textAlign: "center"}}> 
      <h3>No 'Place' breakdown for {county} county</h3>
      </p>);
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

    let newScalingType = getToggledScaleName(state.cumulativeScale);

    let newState = { ...state, cumulativeScale: newScalingType };

    console.log("toggleCumulativeScale: setState to", newScalingType);
    setState(newState);
  }

  console.log(
    `Covid Chart Place redrawing for ${covidType}, ${county}, ${place}`
  );

  return (
    <div className="CovidChartPlace">
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

export default withStyles(useStyles)(CovidChartPlace);

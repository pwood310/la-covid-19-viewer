// import { render } from 'react-dom';
import React, {useState, useMemo} from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
//import _ from "lodash";
import {withStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import {useQuery} from "react-query";

import "./CovidChartPlace.css";

import {
    LATimesRetriever,
    PlaceTotals,
    PlaceDateTotal
} from "../lib/LATimesRetriever";
import {
    ChartDailyRowInput,
    ChartDailyRow,
    extractWorkingData,
    fullyPopulateChartInfo,
} from "../lib/LATimesChartUtils";

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
};

interface IState {
    cumulativeScale: any;
    dailyScale: any;
    hoverData: any;
}

function CovidChartPlace(props: Props): any {
    const [state, setState] = useState<IState>({
        cumulativeScale: "linear",
        dailyScale: "linear",
        hoverData: null,
    });

    const {county, place} = props;

    function retrieve(): () => Promise<PlaceTotals> {
        const retriever = new LATimesRetriever();
        return async () => {
            return await retriever.retrievePlaceTotals();
        };
    }

    const {isLoading, isError, data, error} = useQuery<PlaceTotals, any>(
        "placeTotals",
        retrieve(),
        {
            staleTime: 2 * 3600 * 1000,
            retry: 2,
        }
    );

    const filteredData: ChartDailyRowInput[] = useMemo(() => {
        if (!data || !data.recordCount ) return [];
        const countyMap = data.countyToPlaceData[county];
        const placeRows = countyMap[place];
        if (!placeRows) return [];

        return placeRows.map((row: PlaceDateTotal) => {
                return {
                    date: row.date,
                    rawCumulative: row.confirmed_cases,
                    rawDaily: 0,
                };
            });
    }, [data, county, place]);

    const dataReadyForCharting: ChartDailyRow[] = useMemo(
        () => extractWorkingData(filteredData, true, false, 7),
        [filteredData]
    );

    //console.log("workingData", place, dataReadyForCharting);

    const memoizedChartOptions = useMemo(
        () =>
            fullyPopulateChartInfo(
                dataReadyForCharting,
                `${place} - ConfirmedCases`,
                state.cumulativeScale,
                state.dailyScale
            ),
        [
            dataReadyForCharting,
            place,
            state.cumulativeScale,
            state.dailyScale,
        ]
    );

    if (isError || error) {
        return <span>Error: {error.message}</span>;
    }

    if (isLoading) {
        return <span>Loading...</span>;
    }

    if (!filteredData || !filteredData.length) {

        return (<div>
            <h3 style={{textAlign: "center"}}>No 'Place' breakdown for {county} county</h3>
        </div>);

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
        const newScalingType = getToggledScaleName(state.cumulativeScale);
        const newState = {...state, cumulativeScale: newScalingType};
        setState(newState);
    }

    function toggleDailyScale() {
        const newScalingType = getToggledScaleName(state.dailyScale);
        const newState = {...state, dailyScale: newScalingType};
        setState(newState);
    }

    console.debug(`Covid Chart Place redrawing for ${county}, ${place}`);

    return (
        <div className="CovidChartPlace">
            <HighchartsReact highcharts={Highcharts} options={memoizedChartOptions}/>
            {/* <h3>Hovering over {hoverData}</h3> */}

            <Button
                onClick={toggleDailyScale.bind(this)}
                variant="outlined"
                color="primary"
                size="small"
            >
                Avg/Daily Scale: {state.dailyScale}
            </Button>
            <Button
                onClick={toggleCumulativeScale.bind(this)}
                variant="outlined"
                color="primary"
                size="small"
            >
                Cumulative Scale: {state.cumulativeScale}
            </Button>
        </div>
    );
}

export default withStyles(useStyles)(CovidChartPlace);

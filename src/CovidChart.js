import { render } from 'react-dom';
import React, { Component } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import _ from 'lodash';

import rawData from './data/rawData.json';


function capitalizeFirstLetter(s) {
    if (!s || typeof (s) != 'string')
        return s;
    return s.slice(0, 1).toUpperCase() + s.slice(1);
}
export class CovidChart extends Component {

    extractDifferenceArray(rawDataArray, labelName) {
        return rawDataArray.map((item, index, arr) => { return index == 0 ? item[labelName] : item[labelName] - arr[index - 1][labelName] });
    }

    createDifferentialRunningAverages(arrayOfObj, labelName, daysInAverage) {
        let arrAvg = (arr) => {
            if (!arr.length)
                return 0;

            let sum = 0;
            for (let i = 0; i < arr.length; i++) {
                sum += arr[i];
            }
            return sum / arr.length;
        }

        let differenceArray = this.extractDifferenceArray(arrayOfObj, labelName);
        let cumulativeArray = [];
        for (let total = 0, i = 0; i < differenceArray.length; i++) {
            total += differenceArray[i];
            cumulativeArray.push(total);
        }

        let averagesArray = differenceArray.map((_item, index, arr) => { return arrAvg(arr.slice(Math.max(0, index + 1 - daysInAverage), index + 1)) });

        let dailyValues = [];
        let cumulativeValues = [];
        for (let i = 0; i < averagesArray.length; i++) {
            let date = new Date(arrayOfObj[i].date).valueOf();
            let dailyItem = { x: date, y: averagesArray[i] };
            let cumulativeItem = { x: date, y: cumulativeArray[i] };

            dailyValues.push(dailyItem);
            cumulativeValues.push(cumulativeItem);
        }
        return { dailyValues, cumulativeValues };
    }

    setSeriesData(chartOptions, showCumulative) {
        let self = this;
        chartOptions.series = null;
        console.log(chartOptions);

        let { dailyValues, cumulativeValues } = this.createDifferentialRunningAverages(rawData, this.props.covidType, 1);
        chartOptions.series = [{
            name: 'daily ' + this.props.covidType,
            data: dailyValues
        }];

        if (showCumulative) {
            chartOptions.series.push({
                name: 'cumulative ' + this.props.covidType,
                data: cumulativeValues
            });
        }
    }


    constructor(props) {
        super(props);

        // props: covidType: [ deaths, confirmedCases ]
        //        initScaleAsLog: [ true, false ]

        console.log('props=', props)

        this.state = {
            // To avoid unnecessary update keep all options in the state.
            showCumulative: true,
            chartOptions: {
                chart: {
                    type: 'spline'
                },
                title: {
                    text: 'LA County COVID-19 2020 - ' + capitalizeFirstLetter(this.props.covidType)
                },
                xAxis: {
                    type: 'datetime'
                },

                yAxis: {
                    //type: props.initScaleAsLog ? 'logarithmic' : 'linear',

                    type: this.props.initScaleAsLog ? 'logarithmic' : 'linear',
                    //minorTickInterval: 0.1,
                    // accessibility: {
                    //   rangeDescription: 'Range: 0.1 to 1000'
                    // }
                },
                plotOptions: {
                    series: {
                        point: {
                            events: {
                                mouseOver: this.setHoverData.bind(this)
                            }
                        }
                    }
                }
            },
            hoverData: null
        };

    }


    setHoverData = (e) => {
        // The chart is not updated because `chartOptions` has not changed.
        //this.setState({ hoverData: e.target.category });
        this.setState({ hoverData: e.target.id });

    };

    toggleScale = () => {
        //  The chart is updated only with new options.
        let newScalingType = this.state.chartOptions.yAxis.type == 'logarithmic' ? 'linear' : 'logarithmic'
        let newState = _.cloneDeep(this.state);
        newState.chartOptions.yAxis.type = newScalingType;
        this.setState(newState);
    };

    toggleShowCumulative = () => {
        //  The chart is updated only with new options.
        let newShowCumulative = !this.state.showCumulative
        let newState = _.cloneDeep(this.state);
        newState.showCumulative = newShowCumulative;
        this.setState(newState);
    };

    render() {
        console.log("render called");
        const { showCumulative, chartOptions, hoverData } = this.state;
        this.setSeriesData(chartOptions, showCumulative);

        return (<div>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            <h3>Hovering over {hoverData}</h3>
            <button onClick={this.toggleScale.bind(this)}>Toggle Scale</button>
            <button onClick={this.toggleShowCumulative.bind(this)}>Toggle Cumulative</button>
        </div>);
    }
}

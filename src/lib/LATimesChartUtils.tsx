import moment from "moment";
import {
  BaseTotalsType,
  PlaceTotalsType,
  CountyTotalsType,
} from "./LATimesRetriever";

function extractDifferenceArray(
  rawDataArray: object[],
  labelName: string
): number[] {
  return rawDataArray.map((item, index, arr) => {
    return index === 0
      ? item[labelName]
      : item[labelName] - arr[index - 1][labelName];
  });
}

function calculateDoublingDays(arr: number[], index: number) {
  const prev = index !== 0 ? arr[index - 1] : 0;
  const curr = arr[index];

  const ratio = curr / prev;
  // ratio = log(2)/log(ratio)
  return Math.LN2 / Math.log(ratio);
}

function createDifferentialRunningAverages(
  arrayOfObj: any[],
  columnName: string
) {
  let arrAvg = (arr: number[]): number => {
    if (!arr.length) return 0;

    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum / arr.length;
  };

  let differenceArray: number[] = extractDifferenceArray(
    arrayOfObj,
    columnName
  );
  let cumulativeArray: number[] = [];
  for (let total = 0, i = 0; i < differenceArray.length; i++) {
    total += differenceArray[i];
    cumulativeArray.push(total);
  }

  let daysInAverage = 7;
  let averagesArray = differenceArray.map((_item, index: number, arr) => {
    return arrAvg(arr.slice(Math.max(0, index + 1 - daysInAverage), index + 1));
  });

  let avgValues = [];
  let dailyValues = [];
  let cumulativeValues = [];

  for (let i = 0; i < averagesArray.length; i++) {
    let date = new Date(arrayOfObj[i].date).valueOf();

    let doublingDays = calculateDoublingDays(averagesArray, i);

    let dailyItem = { x: date, y: differenceArray[i] };
    let avgItem = { x: date, y: averagesArray[i], dRate: doublingDays };
    let cumulativeItem = { x: date, y: cumulativeArray[i] };

    dailyValues.push(dailyItem);
    avgValues.push(avgItem);
    cumulativeValues.push(cumulativeItem);
  }
  return { dailyValues, avgValues, cumulativeValues };
}

function snakeToPascal(s: string) {
  if (!s || typeof s != "string") return s;

  s = capitalizeFirstLetter(s);

  let idx = s.indexOf("_");
  while (idx !== -1) {
    s = s.slice(0, idx) + capitalizeFirstLetter(s.slice(idx + 1));
    idx = s.indexOf("_");
  }
  return s;
}

function capitalizeFirstLetter(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

/**
 * Fix cases where aggregated values that should be monotonically
 * increasing sometimes decrease for a day.
 * This adjusts the columns and adds a ${columnName}_leveled column
 * with the new value
 * The incoming object is unchanged
 *
 * @param {BaseTotalsType[]} sortedArray
 * @param {string} columnName
 * @param {string} newColSuffix
 * @return {BaseTotalsType[]}
 */
function levelSortedData(
  sortedArray: BaseTotalsType[],
  columnName: string,
  newColSuffix: string = "_leveled"
): BaseTotalsType[] {
  const newCol = newColSuffix ? columnName + newColSuffix : columnName;

  let maxVal = 0;
  return sortedArray.map((value: BaseTotalsType, index, arr) => {
    maxVal = Math.max(value[columnName], maxVal);
    return { ...value, [newCol]: maxVal };
  });
}
/**
 *
 *
 * @export
 * @param {{ county: string; place?: string; date: string }[]} allCountyTotals
 * @param {string} county
 * @param {string} [place]
 * @return {*}  {any[]}
 */
export function filterAndSortByDate(
  allCountyTotals: BaseTotalsType[],
  county: string,
  place: string,
  cumulativeColumnName: string,
  levelData: boolean
): BaseTotalsType[] {
  console.log("AllCOunty!", allCountyTotals);

  if (!allCountyTotals) return null;

  let tots = filterByCountyAndPlace(allCountyTotals, county, place);

  console.log("Tots!", tots);

  tots = tots.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  if (levelData) tots = levelSortedData(tots, cumulativeColumnName, "");
  //tots = levelTheData(tots, cumulativeColumnName);

  return tots;
}

// export function furtherNormalizeRows(
//   dailyAccumTotals: { date: string }[],
//   fillInMissingDays: boolean,
//   dayOfWeekToFilter?: number
// ): object[] {
//   if (!fillInMissingDays && dayOfWeekToFilter === undefined)
//     return dailyAccumTotals;

//   let result = dailyAccumTotals;

//   // TODO: Add this in
//   // if (fillInMissingDays) {
//   //   let currentDay = null;
//   //   result = [];
//   //   for
//   // }
//   if (dayOfWeekToFilter === undefined) return result;

//   // doing this after the sort because we might want to fill in missing days.
//   return dailyAccumTotals.filter(
//     (item) => moment(item.date).weekday() === dayOfWeekToFilter
//   );
// }

function filterByCountyAndPlace(
  allCountyTotals: BaseTotalsType[],
  county: string,
  place: string
): BaseTotalsType[] {
  const placeTotals = allCountyTotals as PlaceTotalsType[];
  const isPlace: boolean = placeTotals.length && !!placeTotals[0].place;

  if (!isPlace) return allCountyTotals.filter((item) => item.county === county);

  return placeTotals.filter(
    (item) => item.county === county && item.place === place
  );
}

function setSeriesData(
  rawData: any[],
  aggregateColumn: string,
  chartOptions: any
): void {
  chartOptions.series = null;
  //console.log(chartOptions);

  let {
    dailyValues,
    avgValues,
    cumulativeValues,
  } = createDifferentialRunningAverages(rawData, aggregateColumn);

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

function createChartOptions(title: string, cumulativeScale: string): any {
  return {
    chart: {
      type: "spline",
      renderTo: "container",
      // animation: false,
      spacingTop: 5,
      spacingRight: 5,
      spacingBottom: 5,
      spacingLeft: 5,
      zoomType: "x",
    },
    title: {
      text: title,
    },
    xAxis: {
      type: "datetime",
    },
    tooltip: {
      //pointFormat: "{series.name}: <b>{point.y:,.0f}</b><br/>",
      formattrrr_NOT_USED: function () {
        return this.points.reduce(function (s, point) {
          return s + "<br/>" + point.series.name + ": " + point.y + "m";
        }, "<b>" + this.x + "</b>");
      },
      formatter: function () {
        return this.points.reduce((s, point) => {
          s += `<br/>${point.series.name}: <b>${point.y.toFixed(0)}</b>`;

          if (point.point.dRate === undefined) return s;

          let dRate = point.point.dRate;
          dRate = !isNaN(dRate) ? dRate.toFixed(0) : "-";
          s += `<br/>Days to Double at Avg Rate: <b> ${dRate}</br>`;

          return s;
        }, "<small><em>" + new Date(this.x).toDateString() + "</em></small>");
      },
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
        type: cumulativeScale,
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
            mouseOver: null,
          },
        },
      },
    },
  };
}

export function fullyPopulateChartInfo(
  rawData: any[],
  county: string,
  place: string,
  aggregateColumn: string,
  cumulativeScale: string
): any {
  if (!rawData || !rawData.length) return {};

  let title = `${place ? place : county} - ${snakeToPascal(aggregateColumn)}`;
  const chartOptions = createChartOptions(title, cumulativeScale);
  // console.log("boo", chartOptions);
  setSeriesData(rawData, aggregateColumn, chartOptions);
  return chartOptions;
}

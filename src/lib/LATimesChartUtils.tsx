import Highcharts from "highcharts";
//import Highcharts, { numberFormat } from "highcharts";

Highcharts.setOptions({
  lang: {
    thousandsSep: ",", // default is a single space
  },
});

export interface ChartDailyRowInput {
  date: string; //	The date when the data were retrieved in ISO 8601 format.
  rawCumulative: number; // The raw cumulative data sometimes decreases due to faulty reporting.
  rawDaily: number; //	reported daily - can be faulty and not same as delta of cumulative
}

export interface ChartDailyRow {
  date: string; //	The date when the data were retrieved in ISO 8601 format.
  dateObj: Date;
  cumulative: number; // value after raw data is processed to never let it decrease
  daily: number; // the daily values derived from the deltas of the monotonicCumulative
  runningAvg: number; // (usually 7 day) running average
  // synthetic: boolean; // is this day absent from original data and thus
}

/**
 * Assuming the cahnge in daily numbers follows an exponential curve,
 * figure out how many cases it takes to ddouble the daily numbers
 * given the increase in cases from last data point to current point
 * Gaps between
 * @param {(ChartDailyRow|null)} prevDay
 * @param {ChartDailyRow} today
 * @return {*} {number}
 */
function calculateDoublingDays(
  prevDay: ChartDailyRow | null,
  today: ChartDailyRow
): number {
  if (prevDay == null) prevDay = today;

  // usually daysElapsed is 1, but we need to cover gaps in days reported and interpolate
  const daysElapsed = Math.round(
    (today.dateObj.valueOf() - prevDay.dateObj.valueOf()) / (3600 * 24 * 1000)
  );

  // ratio = log(2)/log(ratio)
  const daysNeededToDoubleCases =
    (daysElapsed * Math.LN2) / Math.log(today.runningAvg / prevDay.runningAvg);

  return daysNeededToDoubleCases;
}

function constructGraphDataArrays(
  arrayOfObj: ChartDailyRow[]
): { dailyValues: any[]; avgValues: any[]; cumulativeValues: any[] } {
  const avgValues: any[] = [];
  const dailyValues: any[] = [];
  const cumulativeValues: any[] = [];

  let prevDay: ChartDailyRow | null = null;

  for (let i = 0; i < arrayOfObj.length; i++) {
    const currentDay: ChartDailyRow = arrayOfObj[i];
    const date = currentDay.dateObj.valueOf();

    const doublingDays: number = calculateDoublingDays(prevDay, currentDay);

    const dailyItem = { x: date, y: currentDay.daily };
    const avgItem = { x: date, y: currentDay.runningAvg, dRate: doublingDays };
    const cumulativeItem = { x: date, y: currentDay.cumulative };

    dailyValues.push(dailyItem);
    avgValues.push(avgItem);
    cumulativeValues.push(cumulativeItem);

    prevDay = currentDay;
  }

  return { dailyValues, avgValues, cumulativeValues };
}

function capitalizeFirstLetter(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

export function snakeToPascal(s: string) {
  if (!s || typeof s != "string") return s;

  s = capitalizeFirstLetter(s);

  let idx = s.indexOf("_");
  while (idx !== -1) {
    s = s.slice(0, idx) + capitalizeFirstLetter(s.slice(idx + 1));
    idx = s.indexOf("_");
  }
  return s;
}

export function extractWorkingData(
  input: ChartDailyRowInput[],
  levelCumulative: boolean,
  displayRawDaily: boolean,
  daysInRunningAverage: number = 7
): ChartDailyRow[] {
  if (daysInRunningAverage < 1)
    throw new RangeError(
      `parameter daysInRunningAverage (${daysInRunningAverage}) must be >= 1`
    );

  const sortedInput: ChartDailyRowInput[] = input.sort(
    (a: ChartDailyRowInput, b: ChartDailyRowInput) => {
      return a.date < b.date ? -1 : b.date < a.date ? 1 : 0;
    }
  );

  let lastCumulatives = [0];

  function pushToRingBuff(cumulative: number): void {
    lastCumulatives.push(cumulative);
    if (lastCumulatives.length > daysInRunningAverage) lastCumulatives.shift();
  }

  const answ: ChartDailyRow[] = [];
  for (let i = 0; i < sortedInput.length; i++) {
    const row: ChartDailyRowInput = sortedInput[i];
    let dateObj: Date = new Date(row.date + "T00:00:00");

    let cumulative: number;
    let daily: number;

    if (i !== 0) {
      let prevValue = answ[i - 1];
      let daysBetween =
        (dateObj.valueOf() - prevValue.dateObj.valueOf()) / (3600 * 24 * 1000);
      if (daysBetween > 1) {
        let rng = Math.min(daysBetween - 1, daysInRunningAverage);
        for (let i = 0; i < rng; i++) pushToRingBuff(prevValue.cumulative);
      }
    }

    const previousCumulative = lastCumulatives[lastCumulatives.length - 1];

    cumulative = row.rawCumulative;

    if (levelCumulative && cumulative < previousCumulative)
      cumulative = previousCumulative;

    let runningAverage =
      (cumulative - lastCumulatives[0]) / lastCumulatives.length;

    if (runningAverage < 0) runningAverage = 0;

    lastCumulatives.push(cumulative);
    if (lastCumulatives.length > daysInRunningAverage) lastCumulatives.shift();

    if (displayRawDaily) {
      daily = row.rawDaily;
    } else {
      daily = cumulative - previousCumulative;
      if (daily < 0) daily = 0;
    }
    const newRow: ChartDailyRow = {
      date: row.date,
      dateObj: dateObj,
      cumulative: cumulative,
      daily: daily,
      runningAvg: runningAverage,
    };

    answ.push(newRow);
  }
  return answ;
}

function setSeriesData(sortedRows: ChartDailyRow[], chartOptions: any): void {
  chartOptions.series = null;
  //console.log(chartOptions);

  let { dailyValues, avgValues, cumulativeValues } = constructGraphDataArrays(
    sortedRows
  );

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

export function createChartOptions(
  title: string,
  cumulativeScale: string,
  dailyScale: string
): {} {
  return {
    chart: {
      time: { useUTC: true },
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
      formatter: function (): any {
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
        type: dailyScale,
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
        type: dailyScale,
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

export function updateGraphScales(
  chartOptions: any,
  cumulativeScale: string,
  dailyScale: string
): void {
  const yAxis = chartOptions.yAxis;
  if (!yAxis || yAxis.length !== 3)
    throw new RangeError(
      `chartOptions is corrupted: chartOptions.yAxis is not array of length 3, yAxis: ${yAxis}`
    );

  yAxis[0].type = dailyScale;
  yAxis[1].type = cumulativeScale;
  yAxis[2].type = dailyScale;
}

export function fullyPopulateChartInfo(
  sortedRows: ChartDailyRow[],
  title: string,
  cumulativeScale: string,
  dailyScale: string
): any {
  if (!sortedRows || !sortedRows.length) return {};

  const chartOptions = createChartOptions(title, cumulativeScale, dailyScale);
  // console.log("boo", chartOptions);
  setSeriesData(sortedRows, chartOptions);
  return chartOptions;
}
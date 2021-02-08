import React from "react";
//import { render } from '@testing-library/react';
import * as LATimesChartUtils from "../lib/LATimesChartUtils";

describe("LATimesChartUtils Tests", () => {
  test("snakeToPascalPrettfiesWithoutSpaces", () => {
    //let result:any = LATimesChartUtils.snakeToPascal("HELLO");
    expect(LATimesChartUtils.snakeToPascal("HELLO")).toEqual("HELLO");
    expect(LATimesChartUtils.snakeToPascal("hello")).toEqual("Hello");
    expect(LATimesChartUtils.snakeToPascal("Hello")).toEqual("Hello");
    expect(
      LATimesChartUtils.snakeToPascal(" hello-  there___sam   and---joe   ")
    ).toEqual("HelloThereSamAndJoe");
    expect(LATimesChartUtils.snakeToPascal("hello-there")).toEqual(
      "HelloThere"
    );
    expect(LATimesChartUtils.snakeToPascal("hello there")).toEqual(
      "HelloThere"
    );
    expect(LATimesChartUtils.snakeToPascal("   hello_there   ")).toEqual(
      "HelloThere"
    );
  });

  test("snakeToPascalPrettfiesWithSpaces", () => {
    //let result:any = LATimesChartUtils.snakeToPascal("HELLO");
    expect(LATimesChartUtils.snakeToPascal("HELLO", true)).toEqual("HELLO");
    expect(LATimesChartUtils.snakeToPascal("hello", true)).toEqual("Hello");
    expect(LATimesChartUtils.snakeToPascal("Hello", true)).toEqual("Hello");
    expect(
      LATimesChartUtils.snakeToPascal(
        " hello-  there___sam   and---joe   ",
        true
      )
    ).toEqual("Hello There Sam And Joe");
    expect(LATimesChartUtils.snakeToPascal("hello-there", true)).toEqual(
      "Hello There"
    );
    expect(LATimesChartUtils.snakeToPascal("hello there", true)).toEqual(
      "Hello There"
    );
    expect(LATimesChartUtils.snakeToPascal("   hello_there   ", true)).toEqual(
      "Hello There"
    );
  });
});

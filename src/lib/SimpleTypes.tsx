// export type BaseTotalsType = {
//   date: string; //	The date when the data were retrieved in ISO 8601 format.
//   county: string; //The name of the county where the city is located.
//   fips: string; //	The FIPS code given to the county by the federal government. Can be used to merge with other data sources.
// };
//
// export interface PlaceTotalsType extends BaseTotalsType {
//   id: string,
//   date: string; //	The date when the data were retrieved in ISO 8601 format.
//   county: string; //The name of the county where the city is located.
//   fips: string; //	The FIPS code given to the county by the federal government. Can be used to merge with other data sources.
//   name: string; //	formerly called 'place': The name of the city, neighborhood or other area.
//   confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
//   note: string; //	In cases where the confirmed_cases are obscured, this explains the range of possible values.
//   x: number; //float	The longitude of the place.
//   y: number; //	float
// };
//
// export interface CountyTotalsType extends BaseTotalsType {
//   county: string; //	The name of the county where the agency is based.
//   fips: string; //	The FIPS code given to the county by the federal government. Can be used to merge with other data sources.
//   date: string; //The date when the data were retrieved in ISO 8601 format.
//   confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
//   deaths: number; // integer	The cumulative number of deaths at that time.
//   new_confirmed_cases: number; //	integer	The net change in confirmed cases over the previous date.
//   new_deaths: number; //	integer	The net change in deaths over the previous date.
// };

export type CountyDateTotal = {
  date: Date; //The date when the data were retrieved in ISO 8601 format.
  confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
  deaths: number; // integer	The cumulative number of deaths at that time.
  new_confirmed_cases: number; //	integer	The net change in confirmed cases over the previous date.
  new_deaths: number; //	integer	The net change in deaths over the previous date.
};

export type CountyTotals = {
  recordCount: number;
  countyToTotals: { [key: string]: Array<CountyDateTotal>; };
};

export type PlaceDateTotal = {
  date: Date; //The date when the data were retrieved in ISO 8601 format.
  confirmed_cases: number; //	integer	The cumulative number of confirmed coronavirus case at that time.
  new_confirmed_cases: number; //	integer	The net change in confirmed cases over the previous date.
  population: number;
};

export type PlaceTotals = {
  recordCount: number;
  countyToPlaceData: { [county: string]: { [name: string]: Array<PlaceDateTotal>; }; };
};

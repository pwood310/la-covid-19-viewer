import React, { useState, useMemo } from "react";
import { useQuery } from "react-query";
import { LATimesRetriever, PlaceTotalsType } from "../lib/LATimesRetriever";

// import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
// import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import "./PlaceSelector.css";
import CovidChartPlace from "./CovidChartPlace";
// const useStyles = makeStyles((theme) => ({
//   formControl: {
//     margin: theme.spacing(1),
//     minWidth: 120,
//   },
//   selectEmpty: {
//     marginTop: theme.spacing(2),
//   },
// }));

type IProp = {
  county: string;
};

const startingCities = { 'Los Angeles': 'Santa Monica', 'San Francisco': '94121' };

function PlaceSelector(props: IProp) {
  // seems not helping problem that only appears in dev mode  const inputEl = React.useRef(null);
  //const classes = useStyles();
  // const [place, setPlace] = useState(props.defaultPlace ?? "");

  const { county } = props;

  const [placesObject, setPlace] = useState(startingCities);

  const possiblePlace = placesObject[county ?? ""] ?? "";

  console.debug(`placeSelector: county=${county}, place=${possiblePlace}`);

  function retrieve(): () => Promise<any[]> {
    const retriever = new LATimesRetriever();
    return async () => {
      return await retriever.retrievePlaceTotals();
    };
  }

  const { isLoading, isError, data, error } = useQuery<PlaceTotalsType[], any>(
    "placeTotals",
    retrieve(),
    {
      staleTime: 2 * 3600 * 1000,
      retry: 2,
    }
  );



  const justNames: string[] = useMemo(() => {
    if (!data) return null;

    return data
      .filter((item) => item.county === county)
      .map((item) => item.place)
      .reduce(
        (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
        []
      )
      .sort();
  }, [data, county]);

  const handleChange = (event) => {
    event.preventDefault();
    const plc = event.target.value;
    setPlace({ ...placesObject, [county]: plc });
  };

  if (isError || error) {
    return <span>Error: {error.message}</span>;
  }

  if (isLoading || justNames === null) {
    return <span>Loading...</span>;
  }

  if (justNames.length === 0) {
    return (<div>
      <h3 style={{ textAlign: "center" }}>No 'Place' breakdown for {county} county</h3>
    </div>);
  }

  let place = placesObject[county] ?? "";

  if (!justNames.includes(place)) {
    place = justNames[0];
  }

  //console.log('normal render')
  return (
    <div>

      <FormControl variant="filled" className="PlaceSelector">
        <InputLabel id="demo-simple-select-label">
          City or Neighborhood
      </InputLabel>
        <Select
          labelId="cali-place-select-label"
          id="cali-place-select"
          value={place}
          onChange={handleChange}
        >
          {justNames.map((plc, index) => (
            <MenuItem key={index} value={plc}>
              {plc}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <CovidChartPlace county={county} place={place} />
    </div>
  );
}

export default PlaceSelector;

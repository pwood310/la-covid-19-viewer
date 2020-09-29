import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "react-query";
import { LATimesRetriever, PlaceTotalsType } from "../lib/LATimesRetriever";

// import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
// import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

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
  defaultPlace?: string;
  onChange: (place: string) => void;
};

function PlaceSelector(props: IProp) {
  // seems not helping problem that only appears in dev mode  const inputEl = React.useRef(null);
  //const classes = useStyles();
  const [place, setPlace] = useState(props.defaultPlace ?? "");

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
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  const { defaultPlace, county, onChange } = props;

  const justNames: string[] = useMemo(() => {
    if (!data) return [];

    return data
      .filter((item) => item.county === county)
      .map((item) => item.place)
      .reduce(
        (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
        []
      )
      .sort();
  }, [data, county]);

  useEffect(() => {
    if (isLoading) return;

    let plc = place;
    if (!justNames.length) {
      if (plc !== "") plc = "";
    } else {
      if (!justNames.includes(plc)) {
        if (justNames.includes(defaultPlace)) plc = defaultPlace;
        else plc = justNames[0];
      }
    }
    if (plc !== place) {
      setPlace(plc);
      if (onChange) onChange(plc);
    }
  }, [justNames, place, onChange, defaultPlace, isLoading]);

  if (isError || error) {
    return <span>Error: {error.message}</span>;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  const handleChange = (event) => {
    event.preventDefault();
    const plc = event.target.value;
    setPlace(plc);
    if (props.onChange) props.onChange(plc);
  };

  return (
    <FormControl>
      <InputLabel id="demo-simple-select-label">Place</InputLabel>
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
  );
}

export default PlaceSelector;

import React, { useState } from "react";
import { useQuery } from "react-query";
import { LATimesRetriever, CountyTotalsType } from "../lib/LATimesRetriever";

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

type IProp = { defaultCounty?: string; onChange: (county: string) => void };

function LACountySelector(props: IProp) {
  // seems not helping problem that only appears in dev mode  const inputEl = React.useRef(null);
  //const classes = useStyles();
  const [county, setCounty] = useState(props.defaultCounty ?? "Los Angeles");

  function retrieve(): () => Promise<any[]> {
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

  if (isError || error) {
    return <span>Error: {error.message}</span>;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  let justNames: string[] = data
    .map((item) => item.county)
    .reduce(
      (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
      []
    )
    .sort();

  const defaultProps = {
    options: justNames,
    getOptionLabel: (option) => option,
  };

  const handleChange = (event) => {
    event.preventDefault();
    const cty = event.target.value;
    setCounty(cty);
    if (props.onChange) props.onChange(cty);
  };

  return (
    <FormControl>
      <InputLabel id="demo-simple-select-label">County</InputLabel>
      <Select
        labelId="cali-county-select-label"
        id="cali-county-select"
        value={county}
        onChange={handleChange}
      >
        {justNames.map((cty, index) => (
          <MenuItem key={index} value={cty}>
            {cty}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default LACountySelector;

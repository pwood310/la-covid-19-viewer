import React, { useState } from "react";
import { QueryClientProvider, QueryClient, useQuery } from "react-query";

import { LATimesRetriever, CountyTotals } from "../lib/LATimesRetriever";

// import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
// import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import "./CountySelector.css";
// const useStyles = makeStyles((theme) => ({
//   formControl: {
//     margin: theme.spacing(1),
//     minWidth: 120,
//   },
//   selectEmpty: {
//     marginTop: theme.spacing(2),
//   },
// }));


const queryClient = new QueryClient()


type IProp = { defaultCounty?: string; queryClient: QueryClient; onChange: (county: string) => void };

function CountySelector(props: IProp) {
  // seems not helping problem that only appears in dev mode  const inputEl = React.useRef(null);
  //const classes = useStyles();
  const [county, setCounty] = useState(props.defaultCounty ?? "Los Angeles");

  function retrieve(): () => Promise<CountyTotals> {
    const retriever = new LATimesRetriever();
    return async () => {
      return await retriever.retrieveCountyTotals();
    };
  }

  const { isLoading, isError, data, error, isFetching } = useQuery<CountyTotals, any>(
    "countyTotals",
    retrieve(),
    {
      staleTime: 2 * 3600 * 1000,
      retry: 2,
    }
  );

  if (isError || error) {
    return <span>Error: {error.message}</span>;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!data) {
    return <span>No Data</span>;
  }

  let justNames: string[] = Object.keys(data.countyToTotals)
    .reduce(
      (unique: string[], item: string) => (unique.includes(item) ? unique : [...unique, item]),
      []
    )
    .sort();

  //   const defaultProps = {
  //     options: justNames,
  //     getOptionLabel: (option) => option,
  //   };

  const handleChange = (event: any) => {
    event.preventDefault();
    const cty = event.target.value;
    setCounty(cty);
    if (props.onChange) props.onChange(cty);
  };

  return (
    <FormControl variant="filled" className="CountySelector">
      <InputLabel id="cali-county-select-lbl">County</InputLabel>
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

export default CountySelector;

import React, { useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { LATimesRetriever } from "../lib/LATimesRetriever";

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
  const inputEl = useRef(null);
  //const [data, setData] = useState({ hits: [] });
  //const classes = useStyles();
  const [county, setCounty] = React.useState(
    props.defaultCounty ?? "Los Angeles"
  );

  function retrieve(filename: string): () => Promise<any[]> {
    const retriever = new LATimesRetriever(filename);
    return async () => {
      return await retriever.retrieve();
    };
  }

  const { isLoading, isError, data, error } = useQuery<any[], any>(
    "latimes-county-totals.csv",
    retrieve("latimes-county-totals.csv"),
    {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    }
  );

  function retrieveAndSort(): () => Promise<any[]> {
    const retriever = new LATimesRetriever("latimes-county-totals.csv");

    return async () => {
      const all = await retriever.retrieve();
      return all;
    };
  }

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
          <MenuItem ref={inputEl} key={index} value={cty}>
            {cty}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default LACountySelector;

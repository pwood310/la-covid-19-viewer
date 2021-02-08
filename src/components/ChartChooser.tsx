import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";

function ChartChooser(props:any) {
  console.log("chartchooser redrawing");
  const [value, setValue] = React.useState("confirmed_cases");

  const handleChange = (event:any) => {
    setValue(event.target.value);
    props.onChoice(value);
  };

  return (
    <FormControl component="fieldset">
      <FormLabel component="legend">Map to Display</FormLabel>
      <RadioGroup
        row={true}
        aria-label="chartType"
        name="chartType"
        value={value}
        onChange={handleChange}
      >
        <FormControlLabel
          value="confirmed_cases"
          control={<Radio />}
          label="Confirmed Cases"
        />
        <FormControlLabel value="deaths" control={<Radio />} label="Deaths" />

        {/* <FormControlLabel value="disabled" disabled control={<Radio />} label="(Disabled option)" /> */}
      </RadioGroup>
    </FormControl>
  );
}
export default ChartChooser;

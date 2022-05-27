import React from "react";
import { useField, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import "./DatePickerField.css";
import "react-datepicker/dist/react-datepicker.css";

export const DatePickerField = ({ ...props }) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(props);
  // If you're wondering why this works. Formik uses the name attribute on JSX tags to determine what to change.
  return (
      <DatePicker
          {...field}
          {...props}
          selected={(field.value && new Date(field.value)) || null}
          onChange={val => {
            setFieldValue(field.name, val);
          }}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
      />
  );
};

export default DatePickerField;

import {Typeahead} from "react-bootstrap-typeahead";
import React, {Dispatch, SetStateAction} from "react";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import {Tag} from "../../objectTypes";

interface IProps {
  variant: "search" | "modal" | "table",
  id?: string,
  selected: any,
  options: any,
  onBlur?: ()=>void,
  onChange: any,
}

const TagsTypeahead = (props: IProps) => {
  switch (props.variant) {
    case "search":
      return (
          <Typeahead
              id={props.id}
              labelKey="name"
              multiple
              onChange={props.onChange}
              options={props.options}
              placeholder="Select tags"
              selected={props.selected}
          />
      )
    case "modal":
      return (
          <Typeahead
              id={props.id}
              labelKey="name"
              multiple
              disabled
              onBlur={props.onBlur}
              onChange={props.onChange}
              options={props.options}
              placeholder="Edit tags"
              style={{minWidth: "80px"}}
              selected={props.selected}
          />
      )
    default:
      return (
          <Typeahead
              id={props.id}
              labelKey="name"
              multiple
              onBlur={props.onBlur}
              onChange={props.onChange}
              options={props.options}
              placeholder="Edit tags"
              style={{minWidth: "80px"}}
              selected={props.selected.filter((n: any)=>n)}
          />
      )
  }
}

export default TagsTypeahead;
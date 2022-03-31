import {Typeahead} from "react-bootstrap-typeahead";
import React from "react";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import {Form} from "react-bootstrap";

const TagsTypeahead = (props) => {
  if (props.options && props.selected && props.onChange && props.onBlur && props.id) {
    if (props.variant === "search") {
      return (
          <Typeahead
              id="tag-search"
              labelKey="name"
              multiple
              onChange={props.onChange}
              options={props.options}
              placeholder="Search by tags"
              selected={props.selected}
          />
      )
    } else if (props.variant === "modal") {
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
    } else {
      // Filter (n=>n) removes any undefined or null tags, which can happen when you delete tags
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
              selected={props.selected.filter(n=>n)}
          />
      )
    }
  } else {
    return(
        <Form.Control type="text" placeholder="Edit tags" />
        )
  }
}

export default TagsTypeahead;
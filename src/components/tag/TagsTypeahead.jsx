import {Menu, MenuItem, Token, Typeahead} from "react-bootstrap-typeahead";
import React from "react";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import {Form} from "react-bootstrap";

const TagsTypeahead = (props) => {
  if (props.options && props.selected) {
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
              clearButton
          />
      )
    } else {
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
              selected={props.selected}
              clearButton
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
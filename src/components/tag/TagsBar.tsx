import React from "react";
import {Container} from "react-bootstrap";
import {Tag} from "../../objectTypes";
const ENDPOINT = "http://localhost:3000";

interface IProps {
  tags: Tag[] | [];
}

interface IState {

}

const TagsBar = (props: IProps) => {

  return (
      <div>
        <Container fluid>
          <h1>Tags</h1>
          {props.tags && props.tags.map((tag: Tag)=> {
            return (
                <p key={tag._id}>{tag.name}</p>
            )
          })}
        </Container>
      </div>
  );
}

export default TagsBar;

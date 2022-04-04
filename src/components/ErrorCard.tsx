import {Card} from "react-bootstrap";
import React from "react";

interface IProps {
  errorStatus: Number,
  errorData: string
}

const ErrorCard = (props: IProps) => {
  return (
      <Card>
        <Card.Body>
          <h1 className={"text-danger"}>
            {props.errorStatus} Error
          </h1>
          <p>Please contact your system administrator with the error code below. </p>
          <small>
            {props.errorStatus}: {props.errorData}
          </small>
        </Card.Body>
      </Card>
  )
}

export default ErrorCard;

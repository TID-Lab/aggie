import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faTimesCircle, faWarning} from "@fortawesome/free-solid-svg-icons";
import {faCircle} from "@fortawesome/free-regular-svg-icons";
import React from "react";
import {Veracity} from "../objectTypes";

interface IProps {
  escalated: boolean,
  id: string,
  variant: "table" | "title"
}

const EscalatedIndication = (props: IProps) => {
  if (props.variant === "table") {
    return (
        <>
          {props.escalated &&
              <OverlayTrigger
                  key={props.id + "escalatedtooltip"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={props.id + "escalated"}>
                      This report is <strong>escalated</strong>.
                    </Tooltip>
                  }
              >
                <Button className={"float-end toolTipIcon"}>
                  <FontAwesomeIcon icon={faWarning} aria-label={"This report is escalated"} className={"text-danger float-end icon__veracity me-1"}/>
                </Button>
              </OverlayTrigger>
          }
        </>
    )
  } else {
    return (
      <>
        {props.escalated &&
            <FontAwesomeIcon icon={faWarning} aria-label={"This report is escalated"} className={"text-danger me-2"}/>
        }
      </>
    )
  }
}

export default EscalatedIndication;
import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {faCircle} from "@fortawesome/free-regular-svg-icons";
import React from "react";
import {Veracity} from "../objectTypes";

interface IProps {
  veracity: Veracity,
  id: string,
  variant: "table" | "title"
}

const VeracityIndication = (props: IProps) => {
  if (props.variant === "table") {
    return (
        <>
          {props.veracity === "Confirmed True" &&
              <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={props.id + "Popover"}>
                      This report is <strong>confirmed true</strong>.
                    </Tooltip>
                  }
              >
                <Button className={"float-end toolTipIcon"}>
                  <FontAwesomeIcon icon={faCheckCircle} title={"This report is confirmed true"} className={"text-primary icon__veracity"}/>
                </Button>
              </OverlayTrigger>

          }
          {props.veracity === "Confirmed False" &&
              <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={props.id + "Popover"}>
                      This report is <strong>confirmed false</strong>.
                    </Tooltip>
                  }
              >
                <Button className={"float-end toolTipIcon"}>
                  <FontAwesomeIcon icon={faTimesCircle} aria-label={"This report is confirmed false"} className={"text-secondary float-end icon__veracity"}/>
                </Button>
              </OverlayTrigger>

          }
          {props.veracity === "Unconfirmed" &&
              <OverlayTrigger
                  key={"right"}
                  placement={"right"}
                  overlay={
                    <Tooltip id={props.id + "Popover"}>
                      This report is <strong>unconfirmed</strong>.
                    </Tooltip>
                  }
              >
                <Button className={"float-end toolTipIcon"}>
                  <FontAwesomeIcon icon={faCircle} aria-label={"This report is unconfirmed"} className={"text-secondary float-end icon__veracity"}/>
                </Button>
              </OverlayTrigger>

          }
        </>
    )
  } else {
    return (
        <>
          {props.veracity === "Confirmed True" &&
              <FontAwesomeIcon icon={faCheckCircle} className={"text-primary me-2"}/>
          }
          {props.veracity === "Confirmed False" &&
              <FontAwesomeIcon icon={faTimesCircle} className={"text-secondary me-2"}/>
          }
          {props.veracity === "Unconfirmed" &&
              <FontAwesomeIcon icon={faCircle} className={"me-2"}/>
          }
        </>
    )
  }

}

export default VeracityIndication;
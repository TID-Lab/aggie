import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";
import {Button} from "react-bootstrap";

const EllipsisToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Button
        variant="light"
        href=""
        ref={ref}
        onClick={e => {
            e.preventDefault();
            onClick(e);
        }}
    >
        {<FontAwesomeIcon icon={faEllipsisV}></FontAwesomeIcon>}
        {children}
    </Button>
));

export default EllipsisToggle;
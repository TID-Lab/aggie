import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";

const EllipsisToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
        href=""
        ref={ref}
        onClick={e => {
            e.preventDefault();
            onClick(e);
        }}
    >
        {<FontAwesomeIcon icon={faEllipsisV}></FontAwesomeIcon>}
        {children}
    </a>
));

export default EllipsisToggle;
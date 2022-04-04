import React from 'react';
import {Nav, Navbar, NavDropdown, Image, Container} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTags, faUsersCog, faCog, faCloud, faKey } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "./ConfirmModal";
import "./AggieNavbar.css";
import {Session} from "../objectTypes";

interface IProps {
  isAuthenticated: boolean,
  session: Session | undefined,
}

const AggieNavbar = (props: IProps) => {
  let location = useLocation();
  return (
    <Navbar className="color-nav" variant="dark" collapseOnSelect expand="lg">
      <Container fluid>
        { !props.isAuthenticated &&
        <Navbar.Brand>
          <Image
              alt="Aggie Logo"
              src="/images/logo-v1.png"
          />
        </Navbar.Brand>
        }
        { props.isAuthenticated &&
            <>
              <Navbar.Brand>
                <Link to={'/reports'}>
                  <Image
                      alt="Aggie Logo"
                      src="/images/logo-v1.png"
                  />{' '}
                </Link>
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav variant={"pills"} className="me-auto">
                  <LinkContainer to={'/reports'}>
                    <Nav.Link className="aggie-nav-link" eventKey="1">
                      Reports
                    </Nav.Link>
                  </LinkContainer>
                  <Nav.Item>
                    <LinkContainer to={'/relevant-reports'}>
                      <Nav.Link className="aggie-nav-link" eventKey="2" title="Item">
                        Relevant Reports
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={'/groups'}>
                      <Nav.Link className="aggie-nav-link" eventKey="3">
                        Groups
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <LinkContainer to={'/analysis'}>
                    <Nav.Link className="aggie-nav-link" eventKey="4">
                      Analysis
                    </Nav.Link>
                  </LinkContainer>
                </Nav>
                <Nav>
                  {props.session && props.session.role ? (
                      <LinkContainer to={'/user/' + props.session._id}>
                        <Nav.Link eventKey="5">
                          <FontAwesomeIcon className="me-2" icon={faUser}/>
                          {props.session ? (
                              <span> {props.session.username} </span>
                          ) : (
                              <span> Undefined </span>
                          )}
                        </Nav.Link>
                      </LinkContainer>
                  ) : (
                      <></>
                  )}
                  <NavDropdown title="Settings" id="nav-dropdown">
                    <LinkContainer to={'/config'}>
                      <NavDropdown.Item eventKey="6.1">
                        <FontAwesomeIcon className="me-2" icon={faCog}/>
                        <span>Configuration</span>
                      </NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to={'/credentials'}>
                      <NavDropdown.Item eventKey="6.2">
                        <FontAwesomeIcon className="me-2" icon={faKey}/>
                        <span>Credentials</span>
                      </NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Divider/>
                    <LinkContainer to={'/users'}>
                      <NavDropdown.Item eventKey="6.3">
                        <FontAwesomeIcon className="me-2" icon={faUsersCog}/>
                        <span>Users</span>
                      </NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to={'/tags'}>
                      <NavDropdown.Item eventKey="6.4">
                        <FontAwesomeIcon className="me-2" icon={faTags}/>
                        <span>Tags</span>
                      </NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to={'/sources'}>
                      <NavDropdown.Item eventKey="6.5">
                        <FontAwesomeIcon className="me-2" icon={faCloud}/>
                        <span>Sources</span>
                      </NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                  <ConfirmModal type={"logout"} variant={"button"}></ConfirmModal>
                </Nav>
              </Navbar.Collapse>
            </>
        }
      </Container>
    </Navbar>
  );
}

export default AggieNavbar;

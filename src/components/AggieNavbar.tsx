import React from 'react';
import {Nav, Navbar, NavDropdown, Image, Container, Offcanvas} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTags, faUsersCog, faCog, faCloud, faKey, faChartLine } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "./ConfirmModal";
import "./AggieNavbar.css";
import {Session} from "../objectTypes";
import {useQueryClient} from "react-query";

interface IProps {
  isAuthenticated: boolean,
  session: Session | undefined,
}

const AggieNavbar = (props: IProps) => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries("groups")
  const location = useLocation();
  return(
      <Navbar className="color-nav" variant="dark" expand={false}>
        <Container fluid>
          {location.pathname === "/login" &&
              <Navbar.Brand>
                <Image
                    alt="Aggie Logo"
                    src="/images/logo-v1.png"
                />
              </Navbar.Brand>
          }
          {location.pathname !== "/login" && props.isAuthenticated &&
              <>
                <Nav variant={"pills"} className={"me-auto aggie-nav"}>
                  <LinkContainer to={'/reports'}>
                    <Navbar.Brand>
                      <Image
                          alt="Aggie Logo"
                          src="/images/logo-v1.png"
                      />
                    </Navbar.Brand>
                  </LinkContainer>
                  <Nav.Item>
                    <LinkContainer to={'/reports'}>
                      <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey="1">
                        Reports
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={'/relevant-reports'}>
                      <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey="2" title="Item">
                        Relevant Reports
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={'/groups'}>
                      <Nav.Link  className={"ps-2 pe-2 aggie-nav-link"} eventKey="3">
                        Groups
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={'/analysis'}>
                      <Nav.Link  className={"ps-2 pe-2 aggie-nav-link"} eventKey="4">
                        Analysis
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                </Nav>
                <Nav>
                  <Navbar.Toggle aria-controls="offcanvasNavbar" />
                </Nav>
                <Navbar.Offcanvas
                    id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel"
                    placement="end"
                    scroll={true}
                >
                  <Offcanvas.Header closeButton>
                    <Offcanvas.Title id="offcanvasNavbarLabel">Navigation</Offcanvas.Title>
                  </Offcanvas.Header>
                  <Offcanvas.Body>
                    <Nav variant={"pills"}>
                      { props.session && props.session.role ? (
                          <Nav.Item>
                            <LinkContainer to={'/user/' + props.session._id}>
                              <Nav.Link eventKey="5" className="ps-2">
                                <FontAwesomeIcon className="me-2" icon={faUser}/>
                                {props.session ? (
                                    <span> {props.session.username} </span>
                                ) : (
                                    <span> Undefined </span>
                                )}
                              </Nav.Link>
                            </LinkContainer>
                          </Nav.Item>
                      ) : (
                          <></>
                      )}
                      <Nav.Item>
                        <LinkContainer to={'/config'}>
                          <Nav.Link eventKey="6" className="ps-2">
                            <FontAwesomeIcon className="me-2" icon={faCog}/>
                            <span>Configuration</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/credentials'}>
                          <Nav.Link eventKey="7" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faKey}/>
                            <span>Credentials</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/users'}>
                          <Nav.Link eventKey="8" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faUsersCog}/>
                            <span>Users</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/tags'}>
                          <Nav.Link eventKey="9" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faTags}/>
                            <span>Tags</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/sources'}>
                          <Nav.Link eventKey="10" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faCloud}/>
                            <span>Sources</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <ConfirmModal type={"logout"} variant={"button"}></ConfirmModal>
                    </Nav>
                  </Offcanvas.Body>
                </Navbar.Offcanvas>
              </>
          }
        </Container>
      </Navbar>
  );
}

export default AggieNavbar;

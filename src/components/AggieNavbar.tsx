import React from 'react';
import {Nav, Navbar, NavDropdown, Image, Container, Offcanvas} from 'react-bootstrap';
import {Link, useLocation} from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTags, faUsersCog, faCog, faCloud, faKey, faFileExport } from "@fortawesome/free-solid-svg-icons";
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
  const eventKeyParse = () => {
    switch (location.pathname) {
      case "/reports":case "/relevant-reports": case "/groups": case "/analysis": case "/users": case "/sources":
      case "/tags": case "/export": case "/config": case "/credentials":
        return location.pathname;
        break;
      default:
        switch (location.pathname.split('/')[1]) {
          case "user":
            if (props.session && props.session._id === location.pathname.split('/')[2]) return "/profile"
            else return "/users";
            break;
          case "group":
            return "/groups";
          case "report":
            return "/reports";
          default:
            return "/404";
        }
        break;
    }
  }

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
          {location.pathname !== "/login" &&
              <>
                <Nav variant={"pills"} className={"me-auto aggie-nav"} activeKey={eventKeyParse()}>
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
                      <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey="/reports">
                        Reports
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={'/relevant-reports'}>
                      <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey="/relevant-reports" title="Item">
                        Relevant Reports
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={'/groups'}>
                      <Nav.Link className={"ps-2 pe-2 aggie-nav-link"} eventKey="/groups">
                        Groups
                      </Nav.Link>
                    </LinkContainer>
                  </Nav.Item>
                  <Nav.Item>
                    <LinkContainer to={'/analysis'}>
                      <Nav.Link  className={"ps-2 pe-2 aggie-nav-link"} eventKey="/analysis">
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
                    <Nav variant={"pills"} activeKey={eventKeyParse()}>
                      { props.isAuthenticated && props.session && props.session.role ? (
                          <Nav.Item>
                            <LinkContainer to={'/user/' + props.session._id}>
                              <Nav.Link eventKey="/profile" className="ps-2">
                                <FontAwesomeIcon className="me-2" icon={faUser}/>
                                {props.session ? (
                                    <span> Your profile </span>
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
                          <Nav.Link eventKey="/config" className="ps-2">
                            <FontAwesomeIcon className="me-2" icon={faCog}/>
                            <span>Configuration</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/credentials'}>
                          <Nav.Link eventKey="/credentials" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faKey}/>
                            <span>Credentials</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/users'}>
                          <Nav.Link eventKey="/users" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faUsersCog}/>
                            <span>Users</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/tags'}>
                          <Nav.Link eventKey="/tags" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faTags}/>
                            <span>Tags</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/sources'}>
                          <Nav.Link eventKey="/sources" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faCloud}/>
                            <span>Sources</span>
                          </Nav.Link>
                        </LinkContainer>
                      </Nav.Item>
                      <Nav.Item>
                        <LinkContainer to={'/export'}>
                          <Nav.Link eventKey="/export" className={"ps-2"}>
                            <FontAwesomeIcon className="me-2" icon={faFileExport}/>
                            <span>Export data</span>
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

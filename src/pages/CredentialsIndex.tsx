import React, { Component } from 'react';
import axios from 'axios';
import {Container, Col, Row} from "react-bootstrap";
import CredentialTable from "../components/credentials/CredentialTable";
import {useQuery, useQueryClient} from "react-query";
import {getSources} from "../api/sources";
import {getCredentials} from "../api/credentials";

interface IProps {
}

const CredentialsIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const credentialsQuery = useQuery("credentials", getCredentials);

  return (
      <div className="mt-4" >
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              <Container fluid>
                <h3 className={"mb-2"}>Credentials</h3>
                { credentialsQuery.isFetched && credentialsQuery.data &&
                <CredentialTable credentials={credentialsQuery.data}></CredentialTable>
                }
              </Container>
            </Col>
            <Col>
              <div className="d-none d-xl-block">
              </div>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default CredentialsIndex;

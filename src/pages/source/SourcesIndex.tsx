import React, { useEffect } from 'react';
import {
  Container,
  Col,
  Row,
  Card,
  ButtonToolbar,
  Table,
  Button,
  Image,
  Form,
  Dropdown,
} from 'react-bootstrap';
import StatsBar from '../../components/StatsBar';
import SourceTable, {
  LoadingSourceTable,
} from '../../components/source/SourceTable';
import { useQuery, useQueryClient } from 'react-query';
import { getSources } from '../../api/sources';
import { getCredentials } from '../../api/credentials';
import { Credential, Source } from '../../objectTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import SourceModal from '../../components/source/SourceModal';
import { AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';

interface IProps {}

let socket: Socket;

const SourcesIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const sourcesQuery = useQuery<Source[] | undefined, AxiosError>(
    'sources',
    getSources
  );
  const credentialsQuery = useQuery<Credential[] | undefined, AxiosError>(
    'credentials',
    getCredentials
  );

  useEffect(() => {
    if (!socket) {
      socket = io('ws://localhost:3000/sources');

      socket.onAny((eventName, tag) => {
        console.log('Message Received from Server', eventName, tag);
        sourcesQuery.refetch();
      });
    }
  });

  // Initialize the state
  return (
    <div className='mt-4'>
      <Container fluid>
        <Row>
          <Col></Col>
          <Col xl={9}>
            <h3>Sources</h3>
            {sourcesQuery.isSuccess &&
              credentialsQuery.isSuccess &&
              sourcesQuery.data &&
              credentialsQuery.data && (
                <Card className='mt-3'>
                  <Card.Header
                    as={ButtonToolbar}
                    className='justify-content-end'
                  >
                    <SourceModal
                      variant={'dropdown'}
                      credentials={credentialsQuery.data}
                    ></SourceModal>
                  </Card.Header>
                  <Card.Body className={'p-0'}>
                    <SourceTable
                      sources={sourcesQuery.data}
                      credentials={credentialsQuery.data}
                    />
                  </Card.Body>
                </Card>
              )}
            {/* QUERY ERROR STATE: TODO: Put this in the SourceTable Component, it makes more sense there. */}
            {sourcesQuery.isError && (
              <Card>
                {sourcesQuery.error && sourcesQuery.error.response && (
                  <Card.Body className={'p-0'}>
                    <h1 className={'text-danger'}>
                      {sourcesQuery.error.response.status} Error
                    </h1>
                    <p>
                      Please contact your system administrator with the error
                      code below.{' '}
                    </p>
                    <small>
                      {sourcesQuery.error.response.status}:{' '}
                      {sourcesQuery.error.response.data}
                    </small>
                  </Card.Body>
                )}
              </Card>
            )}
            {sourcesQuery.isLoading && (
              <Card className='mt-3'>
                <Card.Header as={ButtonToolbar} className='justify-content-end'>
                  <Button variant={'primary'}>
                    <FontAwesomeIcon
                      icon={faPlusCircle}
                      className='me-2'
                    ></FontAwesomeIcon>
                    Create source
                  </Button>
                </Card.Header>
                <Card.Body className='p-0'>
                  <LoadingSourceTable />
                </Card.Body>
              </Card>
            )}
          </Col>
          <Col>
            <div className='d-none d-xl-block'>{/*<StatsBar/>*/}</div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SourcesIndex;

import React from 'react';
import {Container, Col, Row} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import UserTable from "../../components/user/UserTable";
import {useQuery, useQueryClient} from "react-query";
import {getUsers} from "../../api/users";

const UsersIndex = () => {
  const queryClient = useQueryClient();
  const usersQuery = useQuery("users", getUsers);

  return (
      <div className="mt-4" >
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              <Container fluid>
                <h3 className={"mb-2"}>Users</h3>
                { usersQuery.isFetched &&
                <UserTable users={usersQuery.data}></UserTable>
                }
              </Container>
            </Col>
            <Col>
              <div className="d-none d-xl-block">
                <StatsBar></StatsBar>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default UsersIndex;

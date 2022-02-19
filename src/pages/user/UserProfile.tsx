import {Container, Col, Row} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import ProfileTable from "../../components/user/UserProfile";
import {useQuery, useQueryClient} from "react-query";
import {getUser} from "../../api/users";
import {useParams} from "react-router-dom";

const UserProfile = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const usersQuery = useQuery(["user", params.id], () => {
    if (params.id) return getUser(params.id);
    else return null;
  });
  return (
      <div className={"mt-2"}>
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              { usersQuery.isFetched &&
              <ProfileTable user={usersQuery.data}/>
              }
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

export default UserProfile;



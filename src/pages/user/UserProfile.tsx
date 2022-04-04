import {Container, Col, Row, Card} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import UserProfileTable from "../../components/user/UserProfileTable";
import {useQuery, useQueryClient, UseQueryResult} from "react-query";
import {getUser} from "../../api/users";
import {useNavigate, useParams} from "react-router-dom";
import {Groups, Session, Source, Tag} from "../../objectTypes";
import {AxiosError} from "axios";
import {compareIds} from "../../helpers";
import GroupTable from "../../components/group/GroupTable";
import React from "react";
import {getGroups} from "../../api/groups";
import {getTags} from "../../api/tags";
import {getSources} from "../../api/sources";

interface IProps {
  session: Session | undefined;
}

const UserProfile = (props: IProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const usersQuery = useQuery(["user", params.id], () => {
    if (params.id) return getUser(params.id);
    else return null;
  });
  const groupsQuery = useQuery<Groups | undefined, AxiosError>("group", ()=> {return getGroups({
    creator: usersQuery.data ? usersQuery.data._id : null,
  })}, {
    enabled: usersQuery.isSuccess,
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });

  const sourcesQuery = useQuery<Source[] | undefined, AxiosError>("sources", getSources, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });

  const tagsQuery = useQuery<Tag[] | undefined, AxiosError>("tags", getTags, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  return (
      <div className={"mt-4"}>
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              { usersQuery.isSuccess && props.session &&
                  <>
                    <UserProfileTable user={usersQuery.data} isCurrentUser={compareIds(usersQuery.data, props.session)}/>

                  </>
              }
              { usersQuery.isSuccess && sourcesQuery.isSuccess && tagsQuery.isSuccess && groupsQuery.isSuccess && props.session &&
                  tagsQuery.data && groupsQuery.data && sourcesQuery.data &&
                  <Container>
                    <h3 className={"mb-3 mt-4"}>{compareIds(usersQuery.data, props.session) ? "Your groups" : "User groups" }</h3>
                    <Card>
                      <GroupTable visibleGroups={groupsQuery.data.results} sources={sourcesQuery.data} users={usersQuery.data} tags={tagsQuery.data}/>
                    </Card>
                  </Container>
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



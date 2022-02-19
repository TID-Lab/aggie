import React from 'react';
import {Container, Col, Row} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import TagTable from "../../components/tag/TagTable";
import {useQuery, useQueryClient} from "react-query";
import {getTags} from "../../api/tags";

interface IProps {
}


const TagsIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const tagsQuery = useQuery("tags", getTags);

  return (
      <div className="mt-2">
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              { tagsQuery.isFetched &&
              <TagTable tags={tagsQuery.data}></TagTable>
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

export default TagsIndex;

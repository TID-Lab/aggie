import React from 'react';
import {Container, Col, Row, Card, ButtonToolbar} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import TagTable from "../../components/tag/TagTable";
import {useQuery, useQueryClient} from "react-query";
import {getTags} from "../../api/tags";
import {Tag} from "../../objectTypes";
import {AxiosError} from "axios";
import TagModal from "../../components/tag/TagModal";

interface IProps {
}


const TagsIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const tagsQuery = useQuery<Tag[] | undefined, AxiosError>("tags", getTags);

  return (
      <div className="mt-4">
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              <Container fluid>
                <h3 className={"mb-3"}>Tags</h3>
                { tagsQuery.isSuccess && tagsQuery.data &&
                    <Card className="mt-4">
                      <Card.Header as={ButtonToolbar} className="justify-content-end">
                        <TagModal/>
                      </Card.Header>
                      <Card.Body className={"p-0"}>
                        <TagTable tags={tagsQuery.data}></TagTable>
                      </Card.Body>
                    </Card>
                }
              </Container>
            </Col>
            <Col>
              <div className="d-none d-xl-block">
                {/*<StatsBar/>*/}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default TagsIndex;

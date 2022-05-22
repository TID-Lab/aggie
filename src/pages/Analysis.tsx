import React, { Component } from 'react';
import axios, {AxiosError} from 'axios';
import ReportsByTags, {LoadingReportsByTags} from '../components/analysis/ReportsByTags';
import ReportsByAuthor, {LoadingReportsByAuthor} from '../components/analysis/ReportsByAuthor';
import ReportsByTime, {LoadingReportsByTime, ReadReportsByTime} from '../components/analysis/ReportsByTime';
import ReportsByMedia, {LoadingReportsByMedia} from '../components/analysis/ReportsByMedia';
import {Container, Card, Col, Row} from "react-bootstrap";
import {
  VisualizationAuthors, VisualizationMedias,
  VisualizationTags, VisualizationTimes, VisualizationWords
} from "../objectTypes";
import {useQuery} from "react-query";
import {getVizAuthors, getVizTags, getVizMedia, getVizTime, getVizWords} from "../api/analysis";
import { TagCloud } from 'react-tagcloud';
import ReportsWordCloud, {AllReportsWordCloud, LoadingReportsWordCloud} from "../components/analysis/ReportsWordCloud";
import ReadReportsWordCloud from "../components/analysis/ReportsWordCloud";
import TotalReportsByTime from "../components/analysis/ReportsByTime";

interface IProps {
}

const Analysis = () => {
  const vizAuthorsQuery = useQuery<VisualizationAuthors | undefined, AxiosError>("analyticsAuthors", getVizAuthors, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const vizTagsQuery = useQuery<VisualizationTags | undefined, AxiosError>("analyticsTags", getVizTags, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const vizMediaQuery = useQuery<VisualizationMedias | undefined, AxiosError>("analyticsMedia", getVizMedia, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const vizWordsQuery = useQuery<VisualizationWords | undefined, AxiosError>("analyticsWords", getVizWords, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const vizTimeQuery = useQuery<VisualizationTimes | undefined, AxiosError>("analyticsTime", getVizTime, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
      <div>
        <Container className={"mt-4"}>
          <Row>
            <Col className={"mb-3"}>
              <Card>
                <Card.Body>
                  <Card.Title>Reports by Time</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Distribution of ALL reports by time</Card.Subtitle>
                  {vizTimeQuery.isSuccess && vizTimeQuery.data &&
                      <TotalReportsByTime
                          time={vizTimeQuery.data.time}
                          time_read={vizTimeQuery.data.time_read}
                          max_time_count={vizTimeQuery.data.maxTimeCount}
                          avg_time_count={vizTimeQuery.data.avgTimeCount}
                      />
                  }
                  {vizTimeQuery.isLoading &&
                      <LoadingReportsByTime/>
                  }
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className={"mb-3"}>
              <Card>
                <Card.Body>
                  <Card.Title>Read Reports by Time</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Distribution of READ reports by time</Card.Subtitle>
                  {vizTimeQuery.isSuccess && vizTimeQuery.data &&
                      <ReadReportsByTime
                          time={vizTimeQuery.data.time}
                          time_read={vizTimeQuery.data.time_read}
                          max_time_count={vizTimeQuery.data.maxReadTimeCount}
                          avg_time_count={vizTimeQuery.data.avgReadTimeCount}
                      />
                  }
                  {vizTimeQuery.isLoading &&
                      <LoadingReportsByTime/>
                  }
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className={"mb-3"}>
              <Card>
                <Card.Body>
                  <Card.Title>Content Word Cloud</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Distribution of Read Reports by Word</Card.Subtitle>
                  {vizWordsQuery.isSuccess && vizWordsQuery.data &&
                      <ReadReportsWordCloud
                          words_read={vizWordsQuery.data.words_read}
                      />
                  }
                  {vizWordsQuery.isLoading &&
                      <LoadingReportsWordCloud/>
                  }
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className={"mb-3"}>
              <Card>
                <Card.Body>
                  <Card.Title>Content Word Cloud</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Distribution of ALL Reports by Word</Card.Subtitle>
                  {vizWordsQuery.isSuccess && vizWordsQuery.data &&
                      <AllReportsWordCloud
                          words={vizWordsQuery.data.words}
                      />
                  }
                  {vizWordsQuery.isLoading &&
                      <LoadingReportsWordCloud/>
                  }
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className={"mb-3"}>
              <Card>
                <Card.Body>
                  <Card.Title>Reports By Author</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Distribution of ALL Reports by Author</Card.Subtitle>
                  {vizAuthorsQuery.isSuccess && vizAuthorsQuery.data &&
                      <ReportsByAuthor authors={vizAuthorsQuery.data.authors}
                                       authors_read={vizAuthorsQuery.data.authors_read}/>
                  }
                  {vizAuthorsQuery.isLoading &&
                      <LoadingReportsByAuthor/>
                  }
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className={"mb-3"}>
              <Card>
                <Card.Body>
                  <Card.Title>Reports by Media</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Distribution of ALL Reports by Media</Card.Subtitle>
                  {vizMediaQuery.isSuccess && vizMediaQuery.data &&
                      <ReportsByMedia media={vizMediaQuery.data.media} media_read={vizMediaQuery.data.media_read}/>
                  }
                  {vizMediaQuery.isLoading &&
                      <LoadingReportsByMedia/>
                  }
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className={"mb-3"}>
              <Card>
                <Card.Body>
                  <Card.Title>Reports By Tags</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">Distribution of ALL reports by Tags</Card.Subtitle>
                  {vizTagsQuery.isSuccess && vizTagsQuery.data &&
                      <ReportsByTags tags={vizTagsQuery.data.tags}/>
                  }
                  {vizTagsQuery.isLoading &&
                      <LoadingReportsByTags/>
                  }
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default Analysis;
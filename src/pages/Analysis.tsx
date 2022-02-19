import React, { Component } from 'react';
import axios from 'axios';
import ReportsByTags from '../components/analysis/ReportsByTags';
import ReportsByAuthor from '../components/analysis/ReportsByAuthor';
import ReportsByTime from '../components/analysis/ReportsByTime';
import ReportsByMedia from '../components/analysis/ReportsByMedia';
import ContentWorldCloud from '../components/analysis/ContentWorldCloud';
import {Container, Card, Col, Row} from "react-bootstrap";
import {Group, Groups, Report, Reports, Source, Tag} from "../objectTypes";

interface IProps {
}

interface IState {
  sources: Source[] | [];
  groups: Groups | null;
  tags: Tag[] | [];
  reports: Reports | null;
}

class Analysis extends Component<IProps, IState> {
  // Initialize the state
  constructor(props: IProps) {
    super(props);
    this.state = {
      sources: [],
      groups: null,
      reports: null,
      tags: [],
    }
  }

  //Fetch the list on the first mount
  componentDidMount() {
    this.getSources();
    this.getGroups();
    this.getTags();
    this.getReports();
  }

  // Retrieves the list of items from the Express app
  getSources = () => {
    axios.get('/api/source')
        .then(res => {
          const sources = res.data;
          this.setState({ sources });
        })
        .catch(err => {
          console.error("Server did not return sources. Check your connection to the internet.")
        })
  }
  getGroups = () => {
    axios.get('/api/incident')
        .then(res => {
          const groups = res.data;
          this.setState({ groups });
        })
        .catch(err => {
          console.error("Server did not return groups. Check your connection to the internet.")
        })
  }
  getTags = () => {
    axios.get('/api/tag')
        .then(res => {
          const tags = res.data;
          this.setState({ tags });
        })
        .catch(err => {
          console.error("Server did not return tags. Check your connection to the internet.")
        })
  }
  getReports = () => {
    axios.get('/api/report?page=0')
        .then(res => {
          const reports = res.data;
          this.setState({ reports });
        })
        .catch(err => {
          console.error("Server did not return reports. Check your connection to the internet.")
        })
  }

  render() {
    let sources: Source[] | [];
    sources = this.state.sources;
    let groups: Group[] | [];
    if (this.state.groups) {
      groups = this.state.groups.results;
    } else {
      groups = [];
    }
    let reports: Report[] | null;
    if (this.state.reports) {
      reports = this.state.reports.results;
    } else {
      reports = [];
    }
    let tags: Tag[] | null;
    tags = this.state.tags;

    return (
        <div>
          <Container className={"mt-2"}>
            <Row>
              <Col className={"mb-3"}>
                <Card>
                  <Card.Body>
                    <Card.Title>Reports by Time</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Distribution of ALL reports by time</Card.Subtitle>
                    <ReportsByTime visibleReports={reports}/>
                  </Card.Body>
                </Card>
              </Col>
              <Col className={"mb-3"}>
                <Card>
                  <Card.Body>
                    <Card.Title>Content Word Cloud</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Distribution of ALL Reports by Word</Card.Subtitle>
                    <ContentWorldCloud visibileReports={reports}/>
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
                    <ReportsByAuthor visibleReports={reports}/>
                  </Card.Body>
                </Card>
              </Col>
              <Col className={"mb-3"}>
                <Card>
                  <Card.Body>
                    <Card.Title>Reports by Media</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">Distribution of ALL Reports by Media</Card.Subtitle>
                    <ReportsByMedia visibleReports={reports}/>
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
                    <ReportsByTags visibleReports={reports}/>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
    );
  }
}

export default Analysis;
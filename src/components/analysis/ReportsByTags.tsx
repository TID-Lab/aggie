import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import {VisualizationTag} from "../../objectTypes";
import {Col, Container, Row, Spinner} from "react-bootstrap";

interface IProps {
  tags: VisualizationTag[],
}

const ReportsByTags = (props: IProps) => {
  return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
            width={500}
            height={300}
            data={props.tags}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis/>
          <Tooltip/>
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <Bar dataKey="count" name="Tagged reports" stackId="media" fill="#82ca9d"/>
        </BarChart>
      </ResponsiveContainer>
  );
}

export const LoadingReportsByTags = () => {
  return (
      <Container fluid>
        <Row className={"justify-content-center"}>
          <Col md={"auto"}>
            <Spinner animation="border" role="status" variant={"primary"}>
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      </Container>
  )
}

export default ReportsByTags;

import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import {Report, VisualizationAuthor} from "../../objectTypes";

interface IProps {
  authors: VisualizationAuthor[],
  authors_read: VisualizationAuthor[]
}

const ReportsByAuthor = (props: IProps) => {
  const authorsReadUnread = props.authors.map((value, index) => {
    if (props.authors.length === props.authors_read.length) {
      return ({
        name: value.name,
        readCount: props.authors_read[index].reportCount,
        unreadCount: value.reportCount - props.authors_read[index].reportCount,
        totalCount: value.reportCount,
      });
    } else {
      console.error("Incorrect author data was provided.");
    }
  });

  return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
            width={500}
            height={300}
            data={authorsReadUnread}
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
          <ReferenceLine y={0} stroke="#000" />
          <Brush dataKey="name" height={30} stroke="#8884d8" />
          <Bar dataKey="readCount" stackId="a" fill="#82ca9d"/>
          <Bar dataKey="unreadCount" stackId="a" fill="#8884d8"/>
        </BarChart>
      </ResponsiveContainer>
  );
}

const LoadingReportsByAuthor = () => {

}

export default ReportsByAuthor;

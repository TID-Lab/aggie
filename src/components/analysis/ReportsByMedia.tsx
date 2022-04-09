import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import {Report, VisualizationAuthor, VisualizationMedia} from "../../objectTypes";

interface IProps {
  media: VisualizationMedia[],
  media_read: VisualizationMedia[]
}

const ReportsByMedia = (props: IProps) => {
  const mediaReadUnread = props.media.map((value, index) => {
    if (props.media.length === props.media_read.length) {
      return ({
        name: value.name,
        readCount: props.media_read[index].count,
        unreadCount: value.count - props.media_read[index].count,
        totalCount: value.count,
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
            data={mediaReadUnread}
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
          <Bar dataKey="readCount" stackId="media" fill="#82ca9d"/>
          <Bar dataKey="unreadCount" stackId="media" fill="#8884d8"/>
        </BarChart>
      </ResponsiveContainer>
  );
}

const LoadingReportsByAuthor = () => {

}

export default ReportsByMedia;

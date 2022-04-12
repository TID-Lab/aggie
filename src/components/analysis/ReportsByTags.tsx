import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import {VisualizationTag} from "../../objectTypes";

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

const LoadingReportsByAuthor = () => {

}

export default ReportsByTags;

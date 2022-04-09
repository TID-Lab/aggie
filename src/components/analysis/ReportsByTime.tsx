import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Area,
  AreaChart
} from 'recharts';
import {VisualizationTime} from "../../objectTypes";

interface IProps {
  time: VisualizationTime[],
  time_read: VisualizationTime[],
  max_time_count: number,
}

const ReportsByTime = (props: IProps) => {
  const timeReadUnread = props.time.map((value, index) => {
    return ({
      time: (new Date(value.year, value.month, value.day, value.hour)),
      totalCount: value.count,
    });
  });
  return (
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart
            width={500}
            height={300}
            data={timeReadUnread}
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
          <ReferenceLine y={props.max_time_count} label={"Max: " + props.max_time_count} stroke="red" strokeDasharray="3 3" />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <ReferenceLine y={0} stroke="#000" />
          <Brush dataKey="time" height={30} stroke="#8884d8" />
          <Area type="monotone" dataKey="totalCount" stroke="#8884d8" fill="#8884d8"/>
        </AreaChart>
      </ResponsiveContainer>
  );
}

const LoadingReportsByAuthor = () => {

}

export default ReportsByTime;

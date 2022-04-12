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
  avg_time_count: number,
}

const TotalReportsByTime = (props: IProps) => {
  const timeTotal = props.time.map((value, index) => {
    return ({
      time: (new Date(value.year, value.month, value.day, value.hour)).getTime(),
      count: value.count,
    });
  });

  return (
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart
            width={500}
            height={300}
            data={timeTotal}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
        >
          <Tooltip labelFormatter={(value: string)=> (new Date(value)).toLocaleString()}></Tooltip>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
              dataKey = 'time'
              domain = {['auto', 'auto']}
              name = 'Time'
              tickFormatter = {(unixTime) => new Date(unixTime).toLocaleString()}
              type = 'number'
          />
          <YAxis/>
          <Tooltip/>
          <ReferenceLine y={props.max_time_count} label={"Max Reports/hr: " + props.max_time_count} stroke="red" strokeDasharray="3 3" />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
          <ReferenceLine y={0} stroke="#000" />
          <Brush dataKey="time" height={30} stroke="#8884d8" />
          <Area type="stepAfter" dataKey="count" stroke="#82ca9d" fill="#82ca9d"/>
        </AreaChart>
      </ResponsiveContainer>
  );
}

export const ReadReportsByTime = (props: IProps) => {
  const timeRead = props.time_read.map((value, index) => {
    return ({
      time: (new Date(value.year, value.month, value.day, value.hour)).getTime(),
      read_count: value.count,
    });
  });

  return (
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart
            width={500}
            height={300}
            data={timeRead}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
              dataKey = 'time'
              domain = {['auto', 'auto']}
              name = 'Time'
              tickFormatter = {(unixTime) => new Date(unixTime).toLocaleString()}
              type = 'number'
          />
          <YAxis/>
          <Tooltip labelFormatter={(value: string)=> (new Date(value)).toLocaleString()}></Tooltip>
          <ReferenceLine y={props.max_time_count} label={"Max Read Reports/hr: " + props.max_time_count} stroke="red" strokeDasharray="3 3" />
          <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }}
              formatter={(value => {
                console.log(value);
                return (value);
              })
              }
          />
          <ReferenceLine y={0} stroke="#000" />
          <Brush dataKey="time" height={30} stroke="#8884d8" tickFormatter = {(unixTime) => new Date(unixTime).toLocaleString()}/>
          <Area type="stepAfter" dataKey="read_count" name="Reports read" stroke="#8884d8" fill="#8884d8"/>
        </AreaChart>
      </ResponsiveContainer>
  );
}

const LoadingReportsByAuthor = () => {

}

export default TotalReportsByTime;

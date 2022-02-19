import React, { PureComponent } from 'react';
import { PieChart, Pie, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import {Report} from "../../objectTypes";

interface IProps {
  visibleReports: Report[] | []
}

interface Data {
  name: String;
  value: number;
}

const data01 = new Array();

export default class ReportsByTags extends PureComponent<IProps, Data> {

  constructor(props: IProps) {
    super(props);
  }

  


  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={data01}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }
}

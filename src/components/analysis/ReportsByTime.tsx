// This will be a line graph
import React, {PureComponent} from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Brush,
    AreaChart,
    Area,
    ResponsiveContainer,
  } from 'recharts';
import {Report} from "../../objectTypes";

interface IProps {
    visibleReports: Report[] | [];
}

interface Data {
    time: Date | any;
    count: number;
}

var finalData = new Array();

export default class ReportsByTime extends PureComponent<IProps, Data> {

    constructor(props: IProps) {
        super(props);
    }

    dates(props: IProps) {
        var reports = Object.values(props.visibleReports);
        var oldDateArray: Array<String> =  [] // should be of length 102
        if (reports.length > 0) {
            reports.forEach((report: Report) => {
                const apiResponse = report.metadata.rawAPIResponse;
                if (apiResponse){
                    if (apiResponse.created_at) {
                        oldDateArray.push(apiResponse.created_at);
                    }
                    if (apiResponse.user && apiResponse.user.created_at) {
                        oldDateArray.push(apiResponse.user.created_at);
                    }
                    if (apiResponse.retweeted_status) {
                        if (apiResponse.retweeted_status.created_at) {
                            oldDateArray.push(apiResponse.retweeted_status.created_at);
                        }
                        if (apiResponse.retweeted_status.user.created_at) {
                            oldDateArray.push(apiResponse.retweeted_status.user.created_at);
                        }
                        if (apiResponse.retweeted_status.quoted_status) {
                            if (apiResponse.quoted_status.created_at) {
                                oldDateArray.push(apiResponse.retweeted_status.quoted_status.created_at);
                            }
                            if (apiResponse.retweeted_status.quoted_status.user.created_at) {
                                oldDateArray.push(apiResponse.retweeted_status.quoted_status.user.created_at);
                            }
                        }
                    }
                }
            });
        } else { // Reports length is 0 and hence either no reports were imported or there exists no reports at the current time.
            finalData = [{
                name: "ankit", 
                count: reports.length
            }];
        }
        // At this point we ideally have all the old dates in an array.

        // Part 2:

        // make a dictionary with UNIQUE keys {Date: count}
        // iterate over the dictionary and make objects for each of the UNIQUE dates
        // sort according to the date.

        // oldDateArray.length = 94 NON-unique dates

        let timeDict: { [x: string]: number; } = {}; // declaring a dictionary
        oldDateArray.forEach((date: String) => {
            let oldDateList = date.split(" ");
            let newDate = oldDateList[0] + " " + oldDateList[1] + " " + oldDateList[5];
            if (!(newDate in timeDict)) { // unique date
                timeDict[newDate] = 1;
            } else { // NOT unique date
                timeDict[newDate] += 1;
            }
        });

        // So the bottom part works for sorting but incorrect entries have been added to the dictionary.
        var items: Data[] = []
        for (const [key, value] of Object.entries(timeDict)) {
            let temporary: Data = {
                time: new Date(key),
                count: value
            }
            items.push(temporary);
        };    
        finalData = items.sort((a,b) => a.time - b.time);

    }
  
    render() {
        this.dates(this.props);
        //this.createChartData(this.props);
      return (
        <div style={{ width: '100%' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              width={500}
              height={200}
              data={finalData}
              syncId="anyId"
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#F012BE" fill="#F012BE" />
              <Brush />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
  }
  
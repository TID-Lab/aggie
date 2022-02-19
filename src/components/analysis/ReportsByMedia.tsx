import React, {PureComponent} from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {Report} from "../../objectTypes";

interface IProps {
    visibleReports: Report[] | []
}

interface Data {
    mediaType: String,
    count: number
}

var finalData = new Array();
var testCount: number = 0;

export default class ReportsByMedia extends PureComponent<IProps, Data> {

    constructor(props: IProps) {
        super(props);
    }

    data(props:IProps) {
        let mediaReports: { [x: string]: number} = {}; // Dictionary where {mediaType: count}
        const reports = Object.values(props.visibleReports);
        if (reports.length > 0) {
            reports.forEach((report: Report) => {
                for (let i = 0; i < report._media.length; i++) { // We are iterating over the _media attribute in the report to see all the media that the report is linked to.
                    if(!(report._media[i] in mediaReports)) { // Unique media
                        mediaReports[report._media[i]] = 1
                    } else { // The media type already exists in the dictionary.
                        mediaReports[report._media[i]] += 1
                    }
                }
            });
            // At this point we have the mediaReports Dictionary. 

            // Create Chart Data
            var data: Data[] = [];
            for (const[key, value] of Object.entries(mediaReports)) { // we iterate over the dictionary and create objects.
                let temporary: Data = {
                    mediaType: key,
                    count: value
                }
                data.push(temporary);
            }
            // now we have the data we need to creat the chart.
            finalData = data;
        } else {
            console.log("There are currently no available reports!");
        }
    }

    render() {
        this.data(this.props);
        return(
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                width={500}
                height={300}
                data={finalData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mediaType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#FF851B" background={{ fill: '#FF851B' }} />
                </BarChart>
            </ResponsiveContainer>
        );
    }
}
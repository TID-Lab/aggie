import React, { PureComponent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {Report} from "../../objectTypes";

interface IProps {
    visibleReports: Report[] | [];
}

interface Data {
    name: String;
    count: number;
}

var dataTest = new Array();

export default class ReportsByAuthor extends PureComponent<IProps, Data> {

    constructor(props: IProps) {
       super(props);
    }

    createDictionary(props: IProps) {
        // Iterate over the reports and create a dictionary with {unique author: counter} where the counter is the number of posts.
        // Side Note: You do not need to get the report.content for all authors but just for those that are displayed on the chart.
        let authorReports: { [x: string]: number; }; // declaring a dictionary
        authorReports = {}; // creating an empty dictionary
        const reports = Object.values(props.visibleReports);
        if (reports.length > 0) {
            reports.forEach((report: Report)=> { //iterating over the dictionary
                if (!(report.author in authorReports)) { // if this is a unique author
                    authorReports[report.author] = 1;
                } else {
                    authorReports[report.author] += 1;
                }
            });
            // Create items array
            var items = Object.keys(authorReports).map(function(key) {
                return [key as any , authorReports[key] as any]; // [key, value, key, value, ...]
            });

            items = items.sort(function(first, second) { // We are sorting cause we ant the top 10 authors by count. So we are sorting the values.
                return second[1] - first[1];
                });
            
            items = items.slice(0,15) // This should return a list of lists [[key, value], [key, value]]

            return (
                items
            )
        } else {
            dataTest = [{
                name: "ankit", 
                count: reports.length
            }];
        }
    }
    
    createChartData(props: IProps) {
        var top10List = this.createDictionary(props);
        if (typeof(top10List) === 'undefined') {
            console.log("No data to create Chart.")
        } else {
            var data: Data[] = []; // List of objects for the chart
            for (let i = 0; i < top10List.length; i++) {
                let firstVar = top10List[i][0]; // the key = author name
                let secondVar = top10List[i][1]; // the value = count
                let temporary: Data = {
                    name: firstVar,
                    count: secondVar
                };
                data.push(temporary);
            }

            dataTest = data;
        }
    }

    render() {
        this.createChartData(this.props)
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                width={500}
                height={300}
                data={dataTest}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" background={{ fill: '#eee' }} />
                </BarChart>
            </ResponsiveContainer>
        );
    }
}

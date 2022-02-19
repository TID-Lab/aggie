import { toHtml } from '@fortawesome/fontawesome-svg-core';
import React, {PureComponent} from 'react';
//@ts-ignore
import ReactWordcloud from 'react-wordcloud';
import {Report} from "../../objectTypes";

interface IProps {
    visibileReports: Report[] | [];
}

interface Data {
    text: String | any;
    value: number;
}

var finalData = new Array();

export default class ContentWorldCloud extends PureComponent<IProps, Data> {

    constructor(props: IProps) {
        super(props);
    }

    // iterate over the reports and make a dictionary of all the words and their counts.
    data(props: IProps) {
        // two paths to possibly obtain data from
        var wordDict: { [x: string]: number;} = {};
        var reports = Object.values(props.visibileReports);
        if (reports.length > 0) {
            reports.forEach((report: Report) => {
                if ((typeof(report.metadata.rawAPIResponse.retweeted_status) !== "undefined") &&
                 (typeof(report.metadata.rawAPIResponse.retweeted_status.extended_tweet) !== "undefined") && 
                 (typeof(report.metadata.rawAPIResponse.retweeted_status.extended_tweet.full_text) !== "undefined")) {
                    // At this point the path to full text exists and therefore we can iterate over it and add words to the dictionary.
                    let textToObtain = report.metadata.rawAPIResponse.retweeted_status.extended_tweet.full_text;
                    let textToObtainList = textToObtain.split(" ");
                    for (let i = 0; i < textToObtainList.length; i++) {
                        if (!(textToObtainList[i] in wordDict)) { // It is a unique word
                            wordDict[textToObtainList[i]] = 1;
                        } else { // NOT UNIQUE word
                            wordDict[textToObtainList[i]] += 1;
                        }
                    }
                } else { // This means that the full text does not exist and therefore we have to use reports.content
                    if (typeof(report.content) !== "undefined") { // checking that the content part exists.
                        let textToObtain = report.content;
                        let textToObtainList = textToObtain.split(" ");
                        for (let i = 0; i < textToObtainList.length; i++) {
                            if(!(textToObtainList[i] in wordDict)) { // It is a unique word
                                wordDict[textToObtainList[i]] = 1;
                            } else { // NOT UNIQUE word
                                wordDict[textToObtainList[i]] += 1;
                            }  
                        }
                    } 
                }
                // At this point we have a dictionary with unique words and their respective counts. 
            });

            // Create Word cloud. 
            var data: Data[] = []
            for (const[key, value] of Object.entries(wordDict)) {
                let temporary: Data = {
                    text: key,
                    value: value
                }
                data.push(temporary);
            }

            finalData = data;

        } else {
            console.log("There are currently no available reports!");
        }
    }
    render() {
        this.data(this.props);
        return(
            <ReactWordcloud words={finalData}/>
        );
    };

}
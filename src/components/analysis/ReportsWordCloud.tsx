import {TagCloud} from "react-tagcloud";
import React from "react";
import {VisualizationWord} from "../../objectTypes";
// https://www.npmjs.com/package/react-tagcloud

interface ReadReportsIProps {
  words_read: VisualizationWord[]
}

const options = {
  luminosity: 'dark',
}

const ReadReportsWordCloud = (props: ReadReportsIProps) => {
  const wordsRead = props.words_read.map((value)=> {
    return {
      value: value.name,
      count: value.count
    }
  });
  return (
      <TagCloud
          minSize={12}
          maxSize={72}
          tags={wordsRead}
          colorOptions={options}
      />
  )
}

interface AllReportsIProps {
  words: VisualizationWord[]
}

export const AllReportsWordCloud = (props: AllReportsIProps) => {
  const words = props.words.map((value)=> {
    return {
      value: value.name,
      count: value.count
    }
  });
  return (
      <TagCloud
          minSize={12}
          maxSize={72}
          tags={words}
          colorOptions={options}
      />
  )
}

export default ReadReportsWordCloud;

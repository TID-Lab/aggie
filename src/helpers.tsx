import {CTList, Group, hasId, Report, ReportSearchState, Source, Tag, Veracity} from "./objectTypes";
import {useLocation} from "react-router-dom";
import {FormikValues} from "formik";

export function tagById (tagId: string, tags: Tag[] | null) {
  // Written for speed, not for best functional programming practices
  if (tags) {
    if (tags.length === 0) return null; // No tags, no return
    let len = tags.length;
    while (len--) {
      if (tags[len]._id === tagId) return tags[len];
    }
    return null;
  }
  return null;
}

export const tagsById = (tagIds: string[] | null | undefined, tags: Tag[] | null | undefined) => {
  // This is O(n^2) but should be fine if n is low
  if (tags && tagIds) {
    if (tags.length === 0) return []; // No tags, no return
    let out = [];
    let len = tagIds.length;
    while (len--) {
      if (tagById(tagIds[len], tags)) out.push(tagById(tagIds[len], tags));
    }
    return out;
  }
  return [];
}

export function sourceById (sourceId: string, sources: Source[]) {
  // Written for speed, not for best functional programming practices
  if (sources) {
    if (sources.length === 0) return null; // No tags, no return
    var len = sources.length;
    while (len--) {
      if (sources[len]._id === sourceId) return sources[len];
    }
    return null;
  }
  return null;
}

export function sourcesById (sourceIds: string[], sources: Source[]) {
  // This is O(n^2) but should be fine if n is low
  // Also this is impossible to make run faster unless an alternative data struct is used
  if (sources.length === 0) return null; // No tags, no return
  var out = [];
  var len = sourceIds.length;
  while (len--) {
    if (!!sourceById(sourceIds[len], sources)) {
      out.push(sourceById(sourceIds[len], sources));
    }
  }
  return out;
}

export function sourcesNamesById (sourceIds: string[], sources: Source[]) {
  // This is O(n^2) but should be fine if n is low
  // Also this is impossible to make run faster unless an alternative data struct is used
  if (sources.length === 0) return null; // No tags, no return
  var out = "";
  var len = sourceIds.length;
  while (len--) {
    if (!!sourceById(sourceIds[len], sources)) {
      out = out + sourceById(sourceIds[len], sources)?.nickname;
    }
  }
  return out;
}

export function groupById (groupId: string, groups: Group[]) {
  // Written for speed, not for best functional programming practices
  if (groups) {
    if (groups.length === 0) return null; // No tags, no return
    var len = groups.length;
    while (len--) {
      if (groups[len]._id === groupId) return groups[len];
    }
    return null;
  }
  return null;
}

export function capitalizeFirstLetter(s: string) {
  return s && s[0].toUpperCase() + s.slice(1);
}

export function booleanValueToChecked(input: boolean) {
  if (input) return "on";
  else return "off";
}

/**
 *
 * @param report
 * @returns imageUrl of the social media image attached to the tweet.
 */
export const reportImageUrl = (report: Report) => {
  // These source image urls from twitter
  if (report.metadata && report.metadata.rawAPIResponse) {
    // This sources the image url from a regular tweet.
    if (report.metadata.rawAPIResponse.extended_tweet) {
      if (report.metadata.rawAPIResponse.extended_tweet.entities) {
        if (report.metadata.rawAPIResponse.extended_tweet.entities.media) {
          return report.metadata.rawAPIResponse.extended_tweet.entities.media[0].media_url_https;
        }
      }
    } else if (report.metadata.rawAPIResponse.retweeted_status) {
      // This sources the image url from a retweet.
      if (report.metadata.rawAPIResponse.retweeted_status.extended_tweet) {
        if (report.metadata.rawAPIResponse.retweeted_status.extended_tweet.entities) {
          if (report.metadata.rawAPIResponse.retweeted_status.extended_tweet.entities.media) {
            return report.metadata.rawAPIResponse.retweeted_status.extended_tweet.entities.media[0].media_url_https;
          }
        }
      }
    } else if (report.metadata.mediaUrl && report.metadata.mediaUrl[0] && report.metadata.mediaUrl[0].url) {
      return report.metadata.mediaUrl[0].url;
    }
  }
  return null;
}
/**
 * This function returns the full text content of a social media post.
 * @param report to return the full text of
 * @returns fullText of the social media post
 */
export const reportFullContent = (report: Report) => {
  if (report.metadata && report.metadata.rawAPIResponse) {
    if (report.metadata.rawAPIResponse.extended_tweet) {
      return report.metadata.rawAPIResponse.extended_tweet.full_text;
    } else if (report.metadata.rawAPIResponse.retweeted_status) {
      if (report.metadata.rawAPIResponse.retweeted_status.extended_tweet) {
        if (report.metadata.rawAPIResponse.retweeted_status.extended_tweet.full_text) {
          return report.metadata.rawAPIResponse.retweeted_status.extended_tweet.full_text;
        }
      }
    }
  }
  return null;
}

export const reportAuthorUrl = (report: Report) => {
  if (report.metadata.accountUrl) {
    return report.metadata.accountUrl;
  } else {
    // Twitter
    return "https://twitter.com/" + report.author;
  }
}

export const reportAuthor = (report: Report) => {
  if (report._media[0] === "twitter") {
    return "@" + report.author;
  } else {
    return report.author;
  }
}

export const objectsToIds = (objects: hasId[]) => {
  const listOfIds = objects.map((object) => {
    return object._id;
  })
  return listOfIds;
}

export const stringToDate = (str: string) => {
  return new Date(str);
}

export const facebookUrlToEmbedUrl = (url: string) => {
  let embedUrl = url.slice(8, url.length);
  return "https://www.facebook.com/plugins/post.php?href=https%3A%2F%2F" + embedUrl + "&width=500&show_text=true";
}

export const hasSearchParams = (searchParams: URLSearchParams) => {
  // TODO: Is there a better way of finding the length of searchParams?
  let counter = 0;
  for (const [index, element] of searchParams.entries()) { counter++; }
  if (searchParams.has("page") && counter == 1) return false;
  else if (searchParams.toString() !== "") return true;
  else return false;
}

export const ctListToOptions = (ctList: CTList) => {
  /*
  TODO: Due to the nature of the returned object for CTLists, this method is a MESS. Might be impossible, but make an effort to make this better
   */
  const ctListSet = new Set();
  if (ctList.lists) {
    const ctListArr = Object.keys(ctList.lists).map((key)=> {return ctList.lists[key]});
    if (ctListArr) {
      const ctListTypes = ctListArr[0];
      if (ctListTypes) {
        const ctListTypesArr = Object.keys(ctListTypes).map((key) => {return ctListTypes[key]});
        if (ctListTypesArr) {
          //@ts-ignore
          Object.values(ctListTypes["crowdtangle_list_account_pairs"]).forEach((value: string[]) => ctListSet.add(value[0]));
          //@ts-ignore
          Object.values(ctListTypes["crowdtangle_saved_searches"]).forEach((value: string[]) => ctListSet.add(value[0]));
          //@ts-ignore
          let optionJSX = [];

          //@ts-ignore
          ctListSet.forEach((option: string) => {
            if (option) {
              //@ts-ignore
              optionJSX.push(<option key={option} value={option}>{option}</option>)
            }
          })
          //@ts-ignore
          return optionJSX;
        }
      }
    }
  }
  return <></>
}

export const compareIds = (objectOne: hasId, objectTwo: hasId) => {
  return objectOne._id === objectTwo._id;
}

export const parseFilterFields = (values: FormikValues) => {
  let parsedFields = Object.assign(removeEmptyStrings(values));
  if (parsedFields.tags && parsedFields.tags.length === 0) delete parsedFields.tags;
  if (parsedFields.after) parsedFields.after = Date.parse(parsedFields.after);
  return parsedFields;
}

function removeEmptyStrings(obj: FormikValues) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== ""));
}

export const searchParamsToObj = (searchParams: URLSearchParams) => {return Object.fromEntries(searchParams.entries())};

export const aggieVeracityOptions: Veracity[] = ["Unconfirmed", "Confirmed False", "Confirmed True"];
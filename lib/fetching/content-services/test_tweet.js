let parTweet = require('twitter-text')

/*
var g = parTweet.extractMentionsWithIndices("Mentioning @twitter and @jack #Twitter facebook.com")
var h = parTweet.extractHashtagsWithIndices("Mentioning @twitter and @jack #Twitter facebook.com")
var i = parTweet.extractUrlsWithIndices("Mentioning @twitter and @jack #Twitter facebook.com")
var j = g.concat(h, i)
console.log(g)
console.log(h)
console.log(i)
console.log(j)

console.log(j.map(i => i['indices']));
*/

function parseTweet(tweet) {
    tweet = tweet.replace(/\n|\r/g, "");
    tweet = tweet.replace(/\sRT\s/g, "");
    console.log(tweet)
    var mentionIdx = parTweet.extractMentionsWithIndices(tweet)
    var hashtagIdx = parTweet.extractHashtagsWithIndices(tweet)
    var urlIdx = parTweet.extractUrlsWithIndices(tweet)
    var combinedIdx = mentionIdx.concat(urlIdx, hashtagIdx).map(i => i['indices'])
    combinedIdx = combinedIdx.sort(function f(f1, f2) {
        s1 = f1[0] + f1[1];
        s2 = f2[0] + f2[1];
        if (s1 < s2) {
            return -1;
        }
        if (s1 > s2) {
            return 1;
        }
        // a must be equal to b
        return 0;
    })
    console.log(combinedIdx)
    let outString = ""
    let currIdx = 0;
    let currInt = 0;
    while (currIdx < tweet.length) {
        let checkInt = combinedIdx[currInt];
        if ((currIdx <= combinedIdx[combinedIdx.length - 1][1]) && (currIdx >= checkInt[0] && currIdx <= checkInt[1])) {
            if (currIdx == combinedIdx[currInt][1]) {
                currInt++;
            }
            currIdx++
            continue
        }
        else {
            outString += tweet[currIdx]
            currIdx++;
        }
    }
    return outString;
}

console.log(parseTweet('This is outrageous #200DaysOfTigrayGenocide #200DaysOfGenocide Nononon #TigrayGenocide #AllowAccessToTigray #UNSCActNow #AmharaOutOfTigray… https://t.co/f5oEvjTxO ዝም አትበሉ የምትፈልጉትን ነገር በግልፅ ተናገሩ'))

const Expression = require("./expression");
const Term = require("./CNF")

let keywords = "A & \"&B\""
keywords = keywords.replace(/\s+/gi, "%")

// Replace 1 or more & with just AND
keywords = keywords.replace(/%*&+%+/g, " AND ")
// Replace 1 or more | with just OR
keywords = keywords.replace(/%*\|+%+/g, " OR ")
// Replace ! with NOT
keywords = keywords.replace(/%*!%+/g, " NOT ");
// Re-add space around operators
keywords = keywords.replace(/\s+/g, " ");
keywords = keywords.replace(/%*NOT%*/g, " NOT ");
keywords = keywords.replace(/%*AND%*/g, " AND ")
keywords = keywords.replace(/%*OR%*/g, " OR ")
keywords = keywords.replace(/\s+/gi, " ")
// Replace " with whitespace, for perfect match
keywords = keywords.replace(/\"/g, "%")
keywords = keywords.replace(/\'/g, "%")
console.log(keywords)
exp = new Expression(keywords)
a = exp.CNF()
console.log(a)
s = exp.generate_search_query()
console.log(JSON.stringify(s))




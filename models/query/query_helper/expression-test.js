const Expression = require("./expression");
const Term = require("./CNF")

let keywords = "\"fauci's knowledge\" & amhara"
keywords = keywords.replace(/\s+/gi, "@")
keywords = keywords.replace(/@!@/g, " NOT ");
// Replace 1 or more & with just AND
keywords = keywords.replace(/@&+@/g, " AND ")
// Replace 1 or more | with just OR
keywords = keywords.replace(/@\|+@/g, " OR ")
// Replace " with whitespace, for perfect match
keywords = keywords.replace(/\"/g, "@")
keywords = keywords.replace(/'/g, "\'")

exp = new Expression(keywords)
s = exp.generate_seach_query()
console.log(JSON.stringify(s))




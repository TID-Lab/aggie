const Expression = require("./expression");
const Term = require("./CNF")

let keywords = "   (\"Amhara\" AND (OLA | militias)) OR ((\"Ethiopia\" AND usa) OR NOT TPLF) "
// Remove whitespace at start and end of query
keywords = keywords.trim()
keywords = keywords.replace(/\s+/gi, "@")

console.log(keywords)
keywords = keywords.replace(/@*!@*/g, " NOT ");
// Replace 1 or more & with just AND
keywords = keywords.replace(/@*&+@*/g, " AND ")
// Replace 1 or more | with just OR
keywords = keywords.replace(/@*\|+@*/g, " OR ")

// Re-add space around operators
keywords = keywords.replace(/@*NOT@*/g, " NOT ");
keywords = keywords.replace(/@*AND@*/g, " AND ")
keywords = keywords.replace(/@*OR@*/g, " OR ")
keywords = keywords.replace(/\s+/gi, " ")
console.log(keywords)
// Replace " with whitespace, for perfect match
keywords = keywords.replace(/\"/g, "@")
keywords = keywords.replace(/'/g, "\'")

console.log(keywords)

exp = new Expression(keywords)
s = exp.generate_seach_query()
console.log(JSON.stringify(s))




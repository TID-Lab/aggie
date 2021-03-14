const Expression = require("./expression");
const Term = require("./CNF")


exp = new Expression("አዎ አዎ")
s = exp.generate_seach_query()
console.log(JSON.stringify(s))




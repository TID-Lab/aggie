const Expression = require("./expression");
const Term = require("./CNF")


exp = new Expression("biden OR covid")
s = exp.generate_seach_query()
console.log(JSON.stringify(s))




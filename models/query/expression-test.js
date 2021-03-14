const Expression = require("./expression");
const Term = require("./CNF")


exp = new Expression("NOT Biden")
s = exp.test()
console.log(JSON.stringify(s))




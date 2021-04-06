var ReParse = require('reparse').ReParse;
var Term = require('./CNF')

// --------------- grammar bits -------------------

function expr() {
    return this.chainl1(term, disjunction);
}

function term() {
    return this.chainl1(notFactor, conjunction);
}

function notFactor() {
    return this.choice(negation, factor);
}

function factor() {
    return this.choice(group, phrase, word);
}

function group() {
    return this.between(/^\(/, /^\)/, expr);
}

function phrase() {
    return this.between(/^\"/, /^\"/, words);
}

function words() {
    return this.many1(word).join(' ');
}

function word() {
    return this.match(/[A-Za-z@\u1200-\u1399\'\/\\]+/i).toString();
}

function notop() {
    return this.match(/^NOT/i).toUpperCase();
}

function negation() {
    return this.seq(notop, notFactor).slice(1);
}

function conjunction() {
    return OPTREES[this.match(/^AND/i).toUpperCase()];
}

function disjunction() {
    return OPTREES[this.match(/^OR/i).toUpperCase()];
}

var OPTREES = {
    'AND': function(a,b) { return [ 'AND', a, b ] },
    'OR': function(a,b) { return [ 'OR', a, b ] }
};

// --------------- test strings -------------------

function buildCNF(tree) {
    var op = tree[0];
    if (op == 'OR') {
        return new Term(Term.OR, buildCNF(tree[1]), buildCNF(tree[2]))
    }
    else if (op == 'AND') {
        let x = new Term(Term.AND, buildCNF(tree[1]), buildCNF(tree[2]))
        return x
    }
    else if (op == 'NOT') {
        let x = buildCNF(tree[1])
        return x.negate()
    }
    else {
        return new Term(Term.LITERAL, tree)
    }
}
function evalTree(tree) {
    var op = tree[0];
    if (op == 'OR') {
        // return "(" + evalTree(tree[1]) + "|" +  evalTree(tree[2]) + ")";
        return {"$or": [evalTree(tree[1]), evalTree(tree[2])]}
    }
    else if (op == 'AND') {
        // return "(?=.+?(" + evalTree(tree[1]) + "))(?=.+?(" + evalTree(tree[2]) + "))"
        return {"$and": [evalTree(tree[1]), evalTree(tree[2])]}
    }
    else if (op == 'NOT') {
        let negated_tree = evalTree(tree[1])
        let neg_content = negated_tree["content"]
        negated_tree["content"] = {'$not': neg_content}
        return negated_tree
    }
    else {
        let x = tree.toString()
        x = x.replace(/\@/gi,  " ")
        return {"content": {"$regex": x, "$options": "si"}}
    }
}

// --------------- collect terms -------------------

function flattenTree(tree) {
    return collectLeaves(tree, [], true);
}

function collectLeaves(tree, leaves, notnot) {
    if (!Array.isArray(tree)) {
        if (notnot) {
            leaves.push(tree);
        }
    }
    else {
        if (tree[0] == "NOT") {
            notnot = !notnot;
        }
        // i = 1 to skip AND/OR
        for (var i = 1; i < tree.length; i++) {
            collectLeaves(tree[i], leaves, notnot);
        }
    }
    return leaves;
}

// --------------- public interface -------------------

function Expression(query) {
    if (!query.includes(" AND ") && !query.includes(" OR ") && !query.includes("NOT")) {
        this.tree = query
    }
    else {
        this.tree = new ReParse(query, true).start(expr);
    }

}

Expression.prototype = {
    flatten: function() {
        return flattenTree(this.tree);
    },
    generate_seach_query: function() {
        let cnfTerm = buildCNF(this.tree).toCNF().toString()
        this.tree = new ReParse(cnfTerm.toString(), true).start(expr);
        return evalTree(this.tree);
    }
}

module.exports = Expression;

function Term(type) {
    this.type = type;
    this.negated = false;

    switch (type) {
        case Term.AND:
        case Term.OR:
            this.left  = arguments[1];
            this.right = arguments[2];
            break;
        case Term.LITERAL:
            this.literal = arguments[1];
            break;
    }
}

Term.AND     = " AND ",
    Term.OR      = " OR ",
    Term.LITERAL = " LITERAL ";

Term.prototype.negate = function () {
    this.negated = !this.negated;
    return this;
};

Term.prototype.deMorgen = function () {
    if (this.hasChildren()) {
        this.negate();
        this.type = this.oppositeType();
        this.left.negate();
        this.right.negate();
    }

    return this;
};

Term.prototype.shoveNegation = function () {
    // top-down
    if (this.negated)
        this.deMorgen();

    if (this.hasChildren()) {
        this.left.shoveNegation();
        this.right.shoveNegation();
    }

    return this;
};

Term.prototype.distributeDisjunction = function () {
    // bottom-up
    if (this.hasChildren()) {
        this.left.distributeDisjunction();
        this.right.distributeDisjunction();
    }

    if (this.type == Term.OR) {
        // (Q && R) || P -> (Q || P) && (R || P)

        var decomposeTarget;        // (Q && R)
        var injectTarget;           // P

        if (this.left.type == Term.AND) {
            decomposeTarget = this.left;
            injectTarget    = this.right;
        } else if (this.right.type == Term.AND) {
            decomposeTarget = this.right;
            injectTarget    = this.left;
        } else {
            // nothing to do
            return this;
        }

        // (Q || P)
        var newLeft = injectTarget.equalTo(decomposeTarget.left)
            ? injectTarget
            : new Term(
                Term.OR,
                decomposeTarget.left,     // Q
                injectTarget              // P
            );

        // (R || P)
        var newRight = injectTarget.equalTo(decomposeTarget.right)
            ? injectTarget
            : new Term(
                Term.OR,
                decomposeTarget.right,    // R
                injectTarget              // P
            );

        this.type  = Term.AND;
        this.left  = newLeft;
        this.right = newRight;
    }

    return this;
};

Term.prototype.toCNF = function () {
    this.shoveNegation();
    this.distributeDisjunction();
    return this;
};

Term.prototype.oppositeType = function () {
    return this.type == Term.AND ? Term.OR : Term.AND;
};

Term.prototype.hasChildren = function () {
    return this.type != Term.LITERAL;
};

// deeply compare
Term.prototype.equalTo = function (term) {
    if (this.type != term.type)
        return false;

    if (this.type == Term.LITERAL)
        return this.literal == term.literal;

    return this.type == term.type &&
        this.left.equalTo(term.left) &&
        this.right.equalTo(term.right);
};

Term.prototype.toString = function () {
    return this.stringExpression(this.type);
};

Term.prototype.stringExpression = function (parentType) {
    var str;

    switch (this.type) {
        case Term.LITERAL:
            str = this.literal;
            break;
        case Term.AND:
        case Term.OR:
            str =
                this.left.stringExpression(this.type) +
                this.type +
                this.right.stringExpression(this.type);
            if (this.negated || this.type != parentType)
                str = "(" + str + ")";
            break;
    }

    return (this.negated ? " NOT " : "") + str;
};

module.exports = Term;

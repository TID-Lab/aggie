#!/bin/sh

for f in test/lib*.js; do mocha $f; done
for f in test/models*.js; do mocha $f; done

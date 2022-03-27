//exposes the ct
'use strict';
var fs = require('fs');
var path = require('path');

exports.ctList_ctLists = (req, res) => {
  let ctLists;
  try {
    const filePath = path.resolve(__dirname, '../../../backend/config/crowdtangle_list.json');
    ctLists = JSON.parse(fs.readFileSync(filePath));
    console.log("ctLists");
    res.header("Content-Type",'application/json');
    res.status(200).send({ lists: ctLists });
  } catch (err) {
    res.send(504, { err: "Cannot get ctlists"});
  }
}
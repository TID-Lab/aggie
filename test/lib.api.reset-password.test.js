// require('./init');
// var expect = require('chai').expect;
// var request = require('supertest');
// var resetPassword = require('../lib/api/reset-password')();
// var User = require('../models/user');
// var Report = require('../models/report');
// var admin;
//
// describe('resetPassword', function() {
//   before(function(done) {
//     User.findOne({ username: admin }, function(err, u) {
//         admin = u;
//         done(err);
//     });
//   });
//
//   describe('PUT /api/reset-admin-password', function() {
//     before(function(done) {
//       // login as admin
//       done();
//     });
//
//     it('should change default admin password', function(done) {
//       request(resetPassword).
//         .put('/api/reset-admin-password')
//         .send({ password: 'newPassword' })
//         .expect(200)
//         .end(function(err, res) {
//           if (err) return done(err);
//           expect(res.body.length).to.equal(2);
//           expect(res.body[0].hasDefaultPassword).to.equal(false);
//           done();
//         });
//     });
//   });
// });

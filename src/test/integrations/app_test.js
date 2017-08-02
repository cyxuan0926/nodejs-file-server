const fs   = require('fs'),
  path     = require('path'),
  chai     = require('chai'),
  chaiHttp = require('chai-http'),
  expect   = chai.expect;
  HASH     = '523b87c4419da5f9186dbe8aa90f37a3876b95e448fe2abf5bf7e4753d5aa25fe88caa7ed96d4a2e89c01f839891b74362bb2450d352f1e4c3d4f7d8d51f5c65';

chai.use(chaiHttp);

describe('app', function() {
  const baseURL = 'http://localhost:1339';

  describe('POST /profile', function() {
    it('expect code 200 when upload avatar success', function(done) {
      chai.request(baseURL).
        post('/profile').
        set('Authorization', HASH).
        attach('avatar', path.join(__dirname, './test_images/good.jpg')).
        end(function(err, res) {
          if (err) {
            console.log(err);
            done(err);
          } else {
            expect(res).to.has.status(200);
            expect(res.body.code).to.be.equals(200);
            expect(res.body.status).to.be.equals('SUCCESS');
            done();
          }
        });
    });

    it('expect code 500 when upload avatar that the file type is invalid', function(done) {
      chai.request(baseURL).
        post('/profile').
        set('Authorization', HASH).
        attach('avatar', path.join(__dirname, './test_images/invalid.amr')).
        end(function(err, res) {
          if (err) {
            console.log(err);
            done(err);
          } else {
            expect(res).to.have.status(200);
            expect(res.body.code).to.be.equal(500);
            expect(res.body.status).to.be.equals('ERROR');
            expect(res.body.message).to.be.equals('Invalid file type');
            done();
          }
        });
    });

   it('expect code 500 when upload avatar that the file is larger than 1024K', function(done) {
      chai.request(baseURL).
        post('/profile').
        set('Authorization', HASH).
        attach('avatar', path.join(__dirname, './test_images/big.jpg')).
        end(function(err, res) {
          if (err) {
            console.log(err);
            done(err);
          } else {
            expect(res).to.have.status(200);
            expect(res.body.code).to.be.equal(500);
            expect(res.body.status).to.be.equals('ERROR');
            expect(res.body.message).to.be.equals('File too large');
            done();
          }
        });
    });
  });

  describe('POST /topics', function() {
    it('expect code 200 when upload topic image success', function(done) {
      chai.request(baseURL).
        post('/topics').
        set('Authorization', HASH).
        attach('topic', path.join(__dirname, './test_images/good.jpg')).
        end(function(err, res) {
          if (err) {
            console.log(err);
            done(err);
          } else {
            expect(res).to.has.status(200);
            expect(res.body.code).to.be.equals(200);
            expect(res.body.status).to.be.equals('SUCCESS');
            done();
          }
        });
    });

    it('expect code 500 when upload topic image that the file type is invalid', function(done) {
      chai.request(baseURL).
        post('/topics').
        set('Authorization', HASH).
        attach('topic', path.join(__dirname, './test_images/invalid.amr')).
        end(function(err, res) {
          if (err) {
            console.log(err);
            done(err);
          } else {
            expect(res).to.have.status(200);
            expect(res.body.code).to.be.equal(500);
            expect(res.body.status).to.be.equals('ERROR');
            expect(res.body.message).to.be.equals('Invalid file type');
            done();
          }
        });
    });

   it('expect code 500 when upload topic image that the file is larger than 1024K', function(done) {
      chai.request(baseURL).
        post('/topics').
        set('Authorization', HASH).
        attach('topic', path.join(__dirname, './test_images/big.jpg')).
        end(function(err, res) {
          if (err) {
            console.log(err);
            done(err);
          } else {
            expect(res).to.have.status(200);
            expect(res.body.code).to.be.equal(500);
            expect(res.body.status).to.be.equals('ERROR');
            expect(res.body.message).to.be.equals('File too large');
            done();
          }
        });
    });
  });
});
//during the test the env variable is set to 'test'
process.env.NODE_ENV = 'test'

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();

chai.use(chaiHttp);

//sample api test
describe('Sample Post /api/test', () => {
    it('it should say HOLA', (done) => {
        chai.request(app)
        .post('/api/test')
        .end((err, res) => {
            res.should.have.status('200');
            res.body.should.have.property('message').eq('HOLA');
            done();
        });
    });
});


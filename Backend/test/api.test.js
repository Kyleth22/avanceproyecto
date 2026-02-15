const request = require('supertest');
const app = require('../server'); 
const pool = require('../db'); 

describe('API de Usuario', () => {
    test('Debería loguear un usuario correctamente', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                correo: 'kyleth2@hotmail.com',
                password: 'Prueba123'
            });
        
        // Verificaciones
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    }, 10000); 
});

afterAll((done) => {
    pool.end(() => {
        done();
    });
});

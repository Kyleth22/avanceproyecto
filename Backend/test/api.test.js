const request = require('supertest');
const app = require('../server');
const pool = require('../db');

describe('API de Usuario', () => {
    test('Debería loguear un usuario correctamente', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                correo: 'juanito@hotmail.com',
                password: 'Prueba123'
            });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    }, 40000);
});

afterAll((done) => {
    pool.end(() => {
        done(); // Indica explícitamente que ya terminamos
    });
}, 20000); // <-- Aumenta a 20 segundos para asegurar el cierre







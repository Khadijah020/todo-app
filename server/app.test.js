import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.DB_PATH = ':memory:';
const { default: app } = await import('./app.js');

test('GET /api/todos returns empty list initially', async () => {
  const res = await request(app).get('/api/todos');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, []);
});

test('POST creates a todo', async () => {
  const res = await request(app).post('/api/todos').send({ title: 'milk' });
  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'milk');
  assert.equal(res.body.done, 0);
  assert.ok(res.body.createdAt);
});

test('POST rejects invalid titles', async () => {
  for (const body of [{}, { title: '' }, { title: '   ' }, { title: 5 }, { title: 'x'.repeat(201) }]) {
    const res = await request(app).post('/api/todos').send(body);
    assert.equal(res.status, 400);
  }
});

test('POST accepts a 200 char title', async () => {
  const res = await request(app).post('/api/todos').send({ title: 'x'.repeat(200) });
  assert.equal(res.status, 201);
});

test('GET lists created todos', async () => {
  const res = await request(app).get('/api/todos');
  assert.ok(res.body.length >= 1);
});

test('PATCH updates title and done', async () => {
  const { body } = await request(app).post('/api/todos').send({ title: 'a' });
  const res = await request(app).patch(`/api/todos/${body.id}`).send({ title: 'b', done: true });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'b');
  assert.equal(res.body.done, 1);
});

test('PATCH updates done only', async () => {
  const { body } = await request(app).post('/api/todos').send({ title: 'a' });
  const res = await request(app).patch(`/api/todos/${body.id}`).send({ done: 1 });
  assert.equal(res.body.title, 'a');
  assert.equal(res.body.done, 1);
});

test('PATCH rejects invalid input', async () => {
  const { body } = await request(app).post('/api/todos').send({ title: 'a' });
  for (const payload of [{}, { title: '' }, { done: 'yes' }]) {
    const res = await request(app).patch(`/api/todos/${body.id}`).send(payload);
    assert.equal(res.status, 400);
  }
});

test('PATCH missing id gives 404', async () => {
  const res = await request(app).patch('/api/todos/9999').send({ done: true });
  assert.equal(res.status, 404);
});

test('DELETE removes a todo', async () => {
  const { body } = await request(app).post('/api/todos').send({ title: 'gone' });
  const res = await request(app).delete(`/api/todos/${body.id}`);
  assert.equal(res.status, 204);
  const again = await request(app).delete(`/api/todos/${body.id}`);
  assert.equal(again.status, 404);
});

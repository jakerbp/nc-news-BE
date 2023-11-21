const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const endpoints = require("../endpoints.json");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(testData);
});

describe("GET", () => {
  test("response is 404 if endpoint doesn't exist", () => {
    return request(app).get("/api/notAnEndpoint").expect(404);
  });
  describe("/api/topics", () => {
    test("response contains array of obj with expected keys", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then((response) => {
          expect(response.body.topics).toHaveLength(3);
          response.body.topics.forEach((topic) => {
            expect(topic).toMatchObject({
              description: expect.any(String),
              slug: expect.any(String),
            });
          });
        });
    });
  });
  describe("/api/ - descriptions", () => {
    test("response contains obj with key for each endpoint", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then((response) => {
          expect(response.body.endpoints).toEqual(endpoints);
        });
    });

    test("response obj endpoint keys each contain description key", () => {
      return request(app)
        .get("/api")
        .then((response) => {
          const allEndpoints = response.body.endpoints;
          expect(Object.keys(allEndpoints).length).toEqual(Object.keys(endpoints).length)
          Object.keys(allEndpoints).forEach((endpoint) => {
            expect(allEndpoints[endpoint]).toMatchObject({
              description: expect.any(String),
              queries: expect.any(Array),
              requestBodyFormat: expect.any(Object),
              exampleResponse: expect.any(Object),
            });
          });
        });
    });
  });
});

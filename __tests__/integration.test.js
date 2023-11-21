const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");

afterAll(() => {
  return db.end();
});

beforeEach(() => {
  return seed(testData);
});

describe("GET", () => {

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

    test("response is 404 if endpoint doesn't exist", () => {
      return request(app).get("/api/notAnEndpoint").expect(404);
    });
  });

  describe("/api/articles/:article_id", () => {
    test("responds with 200 upon success", () => {
      return request(app).get("/api/articles/1").expect(200);
    });

    test("responds with article object with expected keys", () => {
      const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      return request(app)
        .get("/api/articles/2")
        .then((response) => {
          expect(response.body.article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.stringMatching(isoDate),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
    });

    test("responds with 404 if article id doesn't exist", () => {
      return request(app)
        .get("/api/articles/999999")
        .expect(404)
        .then((request) => {
          expect(request.body.msg).toEqual("Article not found!");
        });
    });

    test("responds with 400 if passed article id is invalid request", () => {
      return request(app)
        .get("/api/articles/banana")
        .expect(400)
        .then((request) => {
          expect(request.body.msg).toEqual("Bad request!");
        });
    });
  });
  
});

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

  describe("/api/articles", () => {
    test("responds with 200", () => {
      return request(app).get("/api/articles").expect(200);
    });

    test("response contains array of expected length", () => {
      return request(app)
        .get("/api/articles")
        .then((response) => {
          expect(response.body.articles).toHaveLength(13);
        });
    });

    test("response contains array of obj with expected keys", () => {
      const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      return request(app)
        .get("/api/articles")
        .then((response) => {
          response.body.articles.forEach((article) => {
            expect(article).toMatchObject({
              article_id: expect.any(Number),
              title: expect.any(String),
              topic: expect.any(String),
              author: expect.any(String),
              created_at: expect.stringMatching(isoDate),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        });
    });

    test("response contains array of obj without body key", () => {
      return request(app)
        .get("/api/articles")
        .then((response) => {
          response.body.articles.forEach((article) => {
            expect(article).not.toHaveProperty("body");
          });
        });
    });

    test("response array is sorted desc by date", () => {
      return request(app)
        .get("/api/articles")
        .then((response) => {
          expect(response.body.articles).toBeSorted({
            key: "created_at",
            descending: true,
          });
        });
    });
  });

  test("responds with 404 if no articles returned", () => {
    return request(app)
      .get("/api/notArticles")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found!");
      });
  });
});

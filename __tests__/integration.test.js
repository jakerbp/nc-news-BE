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

    test("response is 404 if endpoint doesn't exist", () => {
      return request(app).get("/api/notAnEndpoint").expect(404);
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
            article_id: 2,
            title: 'Sony Vaio; or, The Laptop',
            topic: 'mitch',
            author: 'icellusedkars',
            body: 'Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.',
            created_at: '2020-10-16T05:03:00.000Z',
            votes: 0,
            article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
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

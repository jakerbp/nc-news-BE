const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data");
const endpoints = require("../endpoints.json");
const comments = require("../db/data/test-data/comments");

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
    describe("/api/articles > queries", () => {
      test("responds only with articles with the queried topic", () => {
        return request(app)
          .get("/api/articles?topic=cats")
          .then(({ body }) => {
            expect(body.articles).toHaveLength(1);
            body.articles.forEach((article)=>{
                expect(article.topic).toBe('cats')
            })
          });
      });

      test("responds only with articles with the queried topic, case insensitive query", () => {
        return request(app)
          .get("/api/articles?topic=cAtS")
          .then(({ body }) => {
            expect(body.articles).toHaveLength(1);
            body.articles.forEach((article)=>{
                expect(article.topic).toBe('cats')
            })
          });
      });

      test("responds with 404 if topic doesn't exist", () => {
        return request(app)
          .get("/api/articles?topic=dogs").expect(404).then(({body}) => {
    
            expect(body.msg).toBe("Not found!");
          })
      });

      test("responds with 200 if topic exists but no articles", () => {
        return request(app)
          .get("/api/articles?topic=paper").expect(200).then(({body}) => {
            expect(body.articles).toEqual([]);
          })
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
            title: "Sony Vaio; or, The Laptop",
            topic: "mitch",
            author: "icellusedkars",
            body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
            created_at: "2020-10-16T05:03:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
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

  describe("/api/articles/:article_id/comments", () => {
    test("responds with 200 upon success", () => {
      return request(app).get("/api/articles/1/comments").expect(200);
    });

    test("responds with array of comments from passed article_id", () => {
      const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      return request(app)
        .get("/api/articles/1/comments")
        .then((response) => {
          const commentsArray = response.body.articleComments;
          expect(commentsArray).toHaveLength(11);
          commentsArray.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              body: expect.any(String),
              article_id: expect.any(Number),
              author: expect.any(String),
              votes: expect.any(Number),
              created_at: expect.stringMatching(isoDate),
            });
          });
        });
    });

    test("responds with 404 if article id doesn't exist", () => {
      return request(app)
        .get("/api/articles/999999/comments")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toEqual("Not found!");
        });
    });

    test("responds with 400 if passed article id is invalid request", () => {
      return request(app)
        .get("/api/articles/banana/comments")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toEqual("Bad request!");
        });
    });

    test("responds with 200 and empty array if article exists but has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(body.articleComments).toEqual([]);
        });
    });

    test("response array is sorted most recent created_at time&date first", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .then((response) => {
          expect(response.body.articleComments).toBeSorted({
            key: "created_at",
            descending: true,
          });
        });
    });
  });

  test("responds with 404 if invalid path", () => {
    return request(app)
      .get("/api/notArticles")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found!");
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
          expect(Object.keys(allEndpoints).length).toEqual(
            Object.keys(endpoints).length
          );
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
            title: "Sony Vaio; or, The Laptop",
            topic: "mitch",
            author: "icellusedkars",
            body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
            created_at: "2020-10-16T05:03:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
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



  describe("POST", () => {
  describe("/api/articles/:article_id/comments", () => {
    test("respond with 201 upon success", () => {
      const newComment = {
        username: "icellusedkars",
        body: "cool new comment!",
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(newComment)
        .expect(201);
    });

    test("respond with posted comment", () => {
      const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      const newComment = {
        username: "icellusedkars",
        body: "cool new comment!",
      };
      const postedComment = {
        comment_id: 19,
        body: "cool new comment!",
        article_id: 2,
        author: "icellusedkars",
        votes: 0,
        created_at: expect.stringMatching(isoDate),
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(newComment)
        .then((response) => {
          expect(response.body.addedComment).toEqual(postedComment);
        });
    });

    test("responds with 400 if article id doesn't exist", () => {
      const newComment = {
        username: "icellusedkars",
        body: "cool new comment!",
      };
      return request(app)
        .post("/api/articles/999999/comments")
        .send(newComment)
        .expect(400)
        .then((request) => {
          expect(request.body.msg).toEqual("Bad request!");
        });
    });

    test("responds with 400 if passed article id is invalid request", () => {
      const newComment = {
        username: "icellusedkars",
        body: "cool new comment!",
      };
      return request(app)
        .post("/api/articles/banana/comments")
        .send(newComment)
        .expect(400)
        .then((request) => {
          expect(request.body.msg).toEqual("Bad request!");
        });
    });

    test("responds with 400 if passed body is missing", () => {
      const newComment = {
        username: "icellusedkars",
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(newComment)
        .expect(400)
        .then((request) => {
          expect(request.body.msg).toEqual("Bad request!");
        });
    });

    test("responds with 400 if passed username is missing", () => {
      const newComment = {
        body: "cool new comment!",
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(newComment)
        .expect(400)
        .then((request) => {
          expect(request.body.msg).toEqual("Bad request!");
        });
    });

    test("responds with 400 if passed username doesn't exist", () => {
      const newComment = {
        username: "jakerbp",
        body: "cool new comment",
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(newComment)
        .expect(400)
        .then((request) => {
          expect(request.body.msg).toEqual("Bad request!");
        });
    });
  });
});


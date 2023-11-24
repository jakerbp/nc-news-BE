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

describe("GET", () => {
  test("responds with 404 and message if endpoint doesn't exist", () => {
    return request(app)
      .get("/api/notAnEndpoint")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found!");
      });
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
      describe("?topic", () => {
        test("responds only with articles with the queried topic", () => {
          return request(app)
            .get("/api/articles?topic=cats")
            .then(({ body }) => {
              expect(body.articles).toHaveLength(1);
              body.articles.forEach((article) => {
                expect(article.topic).toBe("cats");
              });
            });
        });

        test("responds only with articles with the queried topic, case insensitive query", () => {
          return request(app)
            .get("/api/articles?topic=cAtS")
            .then(({ body }) => {
              expect(body.articles).toHaveLength(1);
              body.articles.forEach((article) => {
                expect(article.topic).toBe("cats");
              });
            });
        });

        test("responds with 404 if topic doesn't exist", () => {
          return request(app)
            .get("/api/articles?topic=dogs")
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toBe("Not found!");
            });
        });

        test("responds with 200 if topic exists but no articles", () => {
          return request(app)
            .get("/api/articles?topic=paper")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).toEqual([]);
            });
        });
      });
      describe("?sort &/or ?order", () => {
        test("responds with array of articles, sorted by created_at and desc as default", () => {
          return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).toHaveLength(13);
              expect(body.articles).toBeSorted({
                key: "created_at",
                descending: true,
              });
            });
        });

        test("responds with array of articles, sorted by created_at and asc if passed", () => {
          return request(app)
            .get("/api/articles?order=asc")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).toHaveLength(13);
              expect(body.articles).toBeSorted({
                key: "created_at",
                descending: false,
              });
            });
        });

        test("responds with array of articles, sorted by comment_count and desc when passed", () => {
          return request(app)
            .get("/api/articles?sort_by=comment_count&order=desc")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).toHaveLength(13);
              expect(body.articles).toBeSorted({
                key: "comment_count",
                descending: true,
              });
            });
        });

        test("responds with array of articles, filtered by topic & sorted by votes and desc when passed", () => {
          return request(app)
            .get("/api/articles?sort_by=comment_count&order=desc&topic=cats")
            .expect(200)
            .then(({ body }) => {
              expect(body.articles).toHaveLength(1);
              expect(body.articles).toBeSorted({
                key: "votes",
                descending: true,
              });
            });
        });

        test("400 if passed invalid order", () => {
          return request(app)
            .get("/api/articles?order=banana")
            .expect(400)
            .then((response) => {
              expect(response.body.msg).toBe(
                "Bad request! banana is not a valid order type."
              );
            });
        });

        test("400 if passed invalid sort_by", () => {
          return request(app)
            .get("/api/articles?sort_by=banana")
            .expect(400)
            .then((response) => {
              expect(response.body.msg).toBe(
                "Bad request! banana is not a valid sort field."
              );
            });
        });

        test("400 if passed invalid sort_by & order type", () => {
          return request(app)
            .get("/api/articles?sort_by=banana&order=orange")
            .expect(400)
            .then((response) => {
              expect(response.body.msg).toBe(
                "Bad request! banana is not a valid sort field. Bad request! orange is not a valid order type."
              );
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

    test("comment count", () => {
      return request(app)
        .get("/api/articles/1")
        .then(({ body }) => {
          expect(body.article).toEqual({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 11,
          });
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

  describe("/api/users", () => {
    test("responds with 200 on success", () => {
      return request(app).get("/api/users").expect(200);
    });

    test("responds with array of objects", () => {
      return request(app)
        .get("/api/users")
        .then(({ body }) => {
          expect(Array.isArray(body.users)).toEqual(true);
          expect(body.users).toHaveLength(4);
          body.users.forEach((user) => {
            expect(typeof user).toBe("object");
          });
        });
    });

    test("response objects have expected keys", () => {
      return request(app)
        .get("/api/users")
        .then(({ body }) => {
          body.users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
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

describe("DELETE", () => {
  describe("/api/comments/:comment_id", () => {
    test("responds with 204 upon success", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });

    test("responds with 404 if comment_id doesn't exist", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Comment with id 9999 does not exist!");
        });
    });

    test("responds with 400 if comment_id is invalid", () => {
      return request(app)
        .delete("/api/comments/banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad request!");
        });
    });

    test("responds with 404 if comment_id is missing", () => {
      return request(app)
        .delete("/api/comments/")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not found!");
        });
    });
  });
});

describe("PATCH", () => {
  describe("/api/articles/:article_id", () => {
    test("responds with 200 and increments vote count as expected", () => {
      const inc_votes = { inc_votes: 123 };
      const articleIncrementedVotes = {
        updatedArticle: {
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
          created_at: "2020-10-16T05:03:00.000Z",
          votes: 123,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        },
      };
      return request(app)
        .patch("/api/articles/2")
        .send(inc_votes)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(articleIncrementedVotes);
        });
    });
    test("responds with 200 and decrements vote count as expected", () => {
      const inc_votes = { inc_votes: -666 };
      const articleIncrementedVotes = {
        updatedArticle: {
          article_id: 2,
          title: "Sony Vaio; or, The Laptop",
          topic: "mitch",
          author: "icellusedkars",
          body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
          created_at: "2020-10-16T05:03:00.000Z",
          votes: -666,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        },
      };
      return request(app)
        .patch("/api/articles/2")
        .send(inc_votes)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(articleIncrementedVotes);
        });
    });

    test("responds with 404 if article doesn't exist", () => {
      const inc_votes = { inc_votes: -666 };
      return request(app)
        .patch("/api/articles/99999")
        .send(inc_votes)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toEqual("Article not found!");
        });
    });

    test("responds with 400 if article invalid", () => {
      const inc_votes = { inc_votes: -666 };
      return request(app)
        .patch("/api/articles/banana")
        .send(inc_votes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual("Bad request!");
        });
    });

    test("responds with 400 if inc_votes invalid", () => {
      const inc_votes = { inc_votes: "banana" };
      return request(app)
        .patch("/api/articles/2")
        .send(inc_votes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual("Bad request!");
        });
    });

    test("responds with 400 if inc_votes missing", () => {
      return request(app)
        .patch("/api/articles/2")
        .send()
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toEqual("Bad request!");
        });
    });
  });
});

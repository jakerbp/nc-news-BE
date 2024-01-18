# NC-News API
## What is this project?
This is an API intending to mimic a real world backend service (such as Reddit) which should provide this information to the front end architecture. It uses the popular `PERN stack` (ie: `Postgres`, `Express`, `React`, `Node`). The `React` frontend will be added at a later stage. 

## Live API demo
https://newssite-zy4v.onrender.com/api/

Available endpoints are listed within ***endpoints.json***.

Please note, the server may take a minute to start if it has been dormant recently.

## Running locally
### 1. Clone locally
1.1 Within your terminal, paste:
    
    git clone https://github.com/jakerbp/nc-news-BE.git

1.2 Install dependencies:

    npm install

1.3 Setup the local Postgres database:

    npm run setup-dbs

1.4 Seed it with test data:

    npm run seed

1.5 Run Jest tests:

    npm test __tests__/integration.test.js

### 2. Create following .env files in main directory:

#### *.env.test*
`PGDATABASE=nc_news_test`

#### *.env.development*
`PGDATABASE=nc_news`

### 3. Minimum requied versions:
|Package    |Version  |
|-----------|--------:|
|Node.js    |   20.6.1|
|Postgres   |     14.9|
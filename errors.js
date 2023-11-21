exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handle404 = (req, res, next) => {
  res.status(404).send({ msg: "Not found!" });
}

exports.handleServerErrors = (err, req, res, next) => {
    console.log(err)
  res.status(500).send({ msg: "Internal Server Error" });
};

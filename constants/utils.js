// eslint-disable-next-line max-classes-per-file
const NOT_FOUND_ERROR = 404;
// const ERROR_CODE = 400;
// const SERVER_ERROR = 500;

class SERVER_ERROR extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}
class ERROR_CODE extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = {
  NOT_FOUND_ERROR,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ERROR_CODE,
  SERVER_ERROR,
};

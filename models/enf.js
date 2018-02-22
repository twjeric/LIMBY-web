class EntryNotFound extends Error {
    constructor(message) {
      super(message);
      this.name = "EntryNotFound";
      Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = EntryNotFound;

var MongoClient = require('mongodb').MongoClient;
var enfError = require('./enf');

function DB() {
    this.db = null;
}

// Connect to database
DB.prototype.connect = function(url, dbName) {
    var _this = this;
	return new Promise(function(resolve, reject) {
		if (_this.db) {
			// Already connected
			resolve();
		} else {
            var __this = _this;
            if (process.env.LENV == 'azure') {
                MongoClient.connect(url, {
                    auth: {
                        user: process.env.MONGO_USER,
                        password: process.env.MONGO_PASSWORD,
                    }
                }).then(
                    function(client) {
                        __this.db = client.db(dbName);
                        console.log("Connected successfully to database");
                        resolve();
                    },
                    function(err) {
                        console.log("Error connecting to database: " + err.message);
                        reject(err);
                    }
                )
            }
            else {
                MongoClient.connect(url)
                .then(
                    function(database) {
                        __this.db = database.db(dbName);
                        console.log("Connected successfully to database");
                        resolve();
                    },
                    function(err) {
                        console.log("Error connecting to database: " + err.message);
                        reject(err);
                    }
                )
            } 
		}
	})
}

// Find entry provided query and limit
DB.prototype.find = function(collection, query, limit=1) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.db.collection(collection, function(err, col) {
            if (err) {
                console.log("Error accessing collection: " + err.message);
                reject(err);
            }
            else {
                col.find(query).limit(limit).toArray(function(err, foundArr) {
                    if (err) {
                        console.log("Error reading cursor: " + err.message);
                        reject(err);
                    }
                    // No entry found
                    else if (typeof(foundArr[0]) == 'undefined') {
                        reject(new enfError);
                    }
                    // At least one entry found
                    else {
                        resolve(limit == 0 ? foundArr : foundArr.slice(0, limit));
                    }
                })
            }
        })
    })
}

// Find the latest entry
DB.prototype.findLatest = function(collection) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.db.collection(collection, function(err, col) {
            if (err) {
                console.log("Error accessing collection: " + err.message);
                reject(err);
            }
            else {
                col.find().sort({"time":-1}).limit(1).toArray(function(err, foundArr) {
                    if (err) {
                        console.log("Error reading cursor: " + err.message);
                        reject(err);
                    }
                    // No entry found
                    else if (typeof(foundArr[0]) == 'undefined') {
                        reject(new enfError);
                    }
                    // At least one entry found
                    else {
                        resolve(foundArr[0]);
                    }
                })
            }
        })
    })
}

// Get result for query as stream
DB.prototype.stream = function(collection, query) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.db.collection(collection, function(err, col) {
            if (err) {
                console.log("Error accessing collection: " + err.message);
                reject(err);
            }
            else {
                resolve(col.find(query).
                    addCursorFlag('tailable', true).
                    addCursorFlag('awaitData', true).
                    stream());
            }
        })
    })
}

// Insert one entry
DB.prototype.insertOne = function(collection, query) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.db.collection(collection, function(err, col) {
            if (err) {
                console.log("Error accessing collection: " + err.message);
                reject(err);
            }
            else {
                col.insertOne(query, function(err, r) {
                    if (err) { // Insert failed
                        console.log("Error reading cursor: " + err.message);
                        reject(err);
                    }
                    // Insert succeeded
                    resolve();
                })
            }
        })
    })
}

module.exports = DB;

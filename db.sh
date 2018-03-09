use Limby

db.createCollection("Users")

db.createCollection("Data")

db.Data.createIndex( { "userid": 1 } )

db.Users.save({ "userid": 0, "email": "god", "hash": "abc", "salt": 1, "at": "5a495ca3a878380c969a64b0c0dcafbc8099888a" })

db.Data.save({ "userid": "0", "time": 1, "value": 1 })
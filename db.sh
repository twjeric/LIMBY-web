use Limby

db.createCollection("Users")

db.createCollection("Data", { capped: true, size: 300000000})

db.Data.createIndex( { "userid": 1 } )
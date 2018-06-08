import pycurl
import pymongo
import time

# curl -H "Authorization: Bearer 65bb9f5f762c30c7899f802bb7eb6cd522cfb6b9" https://api.particle.io/v1/devices/360057000351353530373132
# curl -H "Authorization: Bearer 65bb9f5f762c30c7899f802bb7eb6cd522cfb6b9" https://api.particle.io/v1/devices/360057000351353530373132/events/weight

def save(data):
    '''save weight data to mLab'''
    uri = 'mongodb://root:toor@ds155577.mlab.com:55577/limby'
    client = pymongo.MongoClient(uri)
    db = client.get_database()
    col = db.Data
    userid = 143744072
    doc = {}
    doc["userid"]=userid
    doc["time"] = int(round(time.time() * 1000))
    val = data[29:36].decode("utf-8")
    print(val)
    doc["value"] = int(float(val))
    print(doc)
    col.insert_one(doc)  

def on_receive(data):
	"""callback function for Particle stream
	"""
	if len(data) > 5:	# omit :OK in response
		save(data)

def sync(deviceId, accessToken):
	"""sync data from Particle to mLab of given device id
	"""
	conn = pycurl.Curl()
	conn.setopt(pycurl.URL, 'https://api.particle.io/v1/devices/'+deviceId+'/events/weight')
	conn.setopt(pycurl.HTTPHEADER, ['Authorization: Bearer '+accessToken])
	conn.setopt(pycurl.WRITEFUNCTION, on_receive)
	try:
		conn.perform()
	except pycurl.error as error:
		errno, errstr = error
		print(errstr)

def main():
    deviceId = '360057000351353530373132'
    accessToken = '65bb9f5f762c30c7899f802bb7eb6cd522cfb6b9'
    sync(deviceId, accessToken)

if __name__ == "__main__":
    main()

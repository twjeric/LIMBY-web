import pycurl
import pymongo

# curl -H "Authorization: Bearer 65bb9f5f762c30c7899f802bb7eb6cd522cfb6b9" https://api.particle.io/v1/devices/360057000351353530373132
# curl -H "Authorization: Bearer 65bb9f5f762c30c7899f802bb7eb6cd522cfb6b9" https://api.particle.io/v1/devices/360057000351353530373132/events/weight

def save(weight):
	"""save weight data to mLab
	"""
	print(weight)

def on_receive(data):
	"""callback function for Particle stream
	"""
	if len(data) > 5:	# omit :OK in response
		weight = data[29:39]
		save(weight)

def sync(deviceId, accessToken):
	"""sync data from Particle to mLab of given device id
	"""
	conn = pycurl.Curl()
	conn.setopt(pycurl.URL, 'https://api.particle.io/v1/devices/'+deviceId+'/events/weight')
	conn.setopt(pycurl.HTTPHEADER, ['Authorization: Bearer '+accessToken])
	conn.setopt(pycurl.WRITEFUNCTION, on_receive)
	try:
		conn.perform()
	except pycurl.error, error:
		errno, errstr = error
		print(errstr)

def main():
	deviceId = '360057000351353530373132'
	accessToken = '65bb9f5f762c30c7899f802bb7eb6cd522cfb6b9'
	sync(deviceId, accessToken)

if __name__ == "__main__":
    main()

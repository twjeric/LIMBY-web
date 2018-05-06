# -*- coding: utf-8 -*-
"""
Created on Tue May  1 19:22:18 2018

@author: jingxi
"""

import requests
from requests.auth import HTTPDigestAuth
import json

# Replace with the correct URL
url = "https://api.particle.io/v1/clients?access_token=6a115e4ac117ba4f7e89c2b55fe0bed925d30ccb"

# It is a good practice not to hardcode the credentials. So ask the user to enter credentials at runtime
myResponse = requests.get(url,auth=HTTPDigestAuth("ko.wing.bird@gmail.com", "qaz123QAZ"), verify=True)
print (myResponse.status_code)

# For successful API call, response code will be 200 (OK)
if(myResponse.ok):

    # Loading the response data into a dict variable
    # json.loads takes in only binary or string variables so using content to fetch binary content
    # Loads (Load String) takes a Json file and converts into python data structure (dict or list, depending on JSON)
    jData = json.loads(myResponse.content)

    print("The response contains {0} properties".format(len(jData)))
    print("\n")
    for key in jData:
        print( key)
        print(jData[key])
else:
    myResponse.raise_for_status()
  # If response code is not ok (200), print the resulting http error code with description

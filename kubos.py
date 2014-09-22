import webapp2
import logging
from base_handler import BaseHandler
import json
import requests
from requests_oauthlib import OAuth1
import base64
import urllib

from keys import client_key
from keys import client_secret
from keys import resource_owner_key
from keys import resource_owner_secret

# oauth documentation: http://requests-oauthlib.readthedocs.org/en/latest/oauth1_workflow.html

class KubosApp(BaseHandler):
    def get(self):
        response = open('/var/www/index.html').read()
        self.response.write(response)

class KubosBoxesApp(BaseHandler):
    def get(self):
        self.response.write(open('/var/www/kubos_boxes.html').read())

class UploadStl(BaseHandler):
    def post(self, *args, **kwargs):

        logging.basicConfig(level=logging.INFO)

        oauth = OAuth1(
            client_key = client_key,
            client_secret = client_secret,
            resource_owner_key = resource_owner_key,
            resource_owner_secret = resource_owner_secret
        )

        file = urllib.quote(base64.b64encode(self.request.get('stl_string')))
        materials = {str(i): {'isActive': '1'} for i in range(101)}
        r = requests.post(
            url = 'https://api.shapeways.com/models/v1',
            data = json.dumps({
                'file': file,
                'fileName': 'test.stl',
                'hasRightsToModel': '1',
                'acceptTermsAndConditions': '1',
                'isPublic': '1',
                'isForSale': '1',
                'materials': materials
            }),
            auth = oauth,
        )
        logging.info('File uploaded to shapeways. Status Code: ' + str(r.status_code))
        #self.response.write('You have successfully uploaded this STL:\n\n' + str(self.request.get('stl_string')))
        self.request.status = str(r.status_code)

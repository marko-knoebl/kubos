import webapp2
from shapeways.client import Client
import logging
from base_handler import BaseHandler
import json
import requests
from requests_oauthlib import OAuth1

from keys import client_key
from keys import client_secret

# oauth documentation: http://requests-oauthlib.readthedocs.org/en/latest/oauth1_workflow.html

# app is connected to shapeways (user has authorized access)
connected = False

import random
session = random.random()

class KubosApp(BaseHandler):
    def get(self):
        response = open('/var/www/index.html').read()
        self.response.write(response)

class Auth(BaseHandler):
    """Get a new verifier URL from the server"""
    def post(self):

        #new

        oauth = OAuth1(client_key, client_secret=client_secret)
        request_token_url = 'https://api.shapeways.com/oauth1/request_token/v1'
        oauth = OAuth1(client_key, client_secret=client_secret)
        r = requests.post(url=request_token_url, auth=oauth)
        from urlparse import parse_qs
        credentials = parse_qs(r.content)
        resource_owner_key = credentials.get('authentication_url')[0].split('=')[1]
        resource_owner_secret = credentials.get('oauth_token_secret')[0]
        authorize_url = credentials['authentication_url'][0]
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps({
            'authorize_url': authorize_url,
            'resource_owner_key': resource_owner_key,
            'resource_owner_secret': resource_owner_secret,
        }))
        return

        #old

        from keys import consumer_key
        from keys import consumer_secret
        global client
        client = Client(consumer_key, consumer_secret)
        self.session['test'] = 13
        url = client.connect()
        global token
        token = url.split('=')[1]
        # return the url to the client who will present it to the consumer
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(
            {'url': url}
        ))
        #self.response.write(response)
        logging.warning(session)

class Verify(BaseHandler):
    def post(self):
        access_token_url = 'https://api.shapeways.com/oauth1/access_token/v1'

        oauth = OAuth1(
            client_key,
            client_secret=client_secret,
            resource_owner_key=self.request.get('resource_owner_key'),
            resource_owner_secret=self.request.get('resource_owner_secret'),
            verifier=self.request.get('verifier_code')
        )
        r = requests.post(url=access_token_url, auth=oauth)
        from urlparse import parse_qs
        credentials = parse_qs(r.content)
        resource_owner_key = credentials.get('oauth_token')[0]
        resource_owner_secret = credentials.get('oauth_token_secret')[0]
        #self.response.write(r.content)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps({
            'client_key': client_key,
            'client_secret': client_secret,
            'resource_owner_key': resource_owner_key,
            'resource_owner_secret': resource_owner_secret,
        }))
        return

        # OLD:

        verifier_code = self.request.get('verifier_code')
        logging.warning(session)
        logging.warning(token)
        1 / (13 - self.session.get('test'))
        client.verify(token, verifier_code)
        global connected
        connected = True
        self.response.write(client.get_api_info())

class GetCart(BaseHandler):
    def get(self):
        client_key = self.request.get('client_key')
        client_secret = self.request.get('client_secret')
        resource_owner_key = self.request.get('resource_owner_key')
        resource_owner_secret = self.request.get('resource_owner_secret')
        oauth = OAuth1(
            client_key,
            client_secret=client_secret,
            resource_owner_key = resource_owner_key,
            resource_owner_secret = resource_owner_secret,
        )
        r = requests.get(url='https://api.shapeways.com/orders/cart/v1', auth=oauth)
        logging.warning(r)

class StoreVerifierCode(BaseHandler):
    def post(self):
        global verifier_code
        verifier_code = self.request.get('verifier_code')
        global connected
        connected = True

class UploadStl(BaseHandler):
    def post(self, *args, **kwargs):
        import requests
        from requests_oauthlib import OAuth1
        import logging
        import json
        import base64
        import urllib

        logging.basicConfig(level=logging.INFO)

        from keys import (client_key, client_secret, resource_owner_key,
            resource_owner_secret)
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

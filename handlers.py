import webapp2
import random

class HelloWorldHandler(webapp2.RequestHandler):
    def get(self):
        foo = self.app.config.get('foo')
        self.response.write('foo value is %s' % foo)
        self.response.write('Go to this adress:' + str(random.randint(1,15)))
        from shapeways.client import Client
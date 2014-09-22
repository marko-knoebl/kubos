# This file contains the WSGI configuration required to serve up your
# web application at http://kubos.pythonanywhere.com/
# It works by setting the variable 'application' to a WSGI handler of some
# description.

import webapp2
#webapp2.application
routes = [
    # redirect everyting to handlers.HelloWorldHandler
    ('/', 'kubos.KubosApp'),
    ('/app', 'guestbook.MainPage'),
    ('/authorize', 'guestbook.Guestbook'),
    ('/kubos', 'kubos.KubosApp'),
    ('/verifier_code', 'kubos.StoreVerifierCode'),
    ('/upload_stl', 'kubos.UploadStl'),
    #('/static/(.+)', 'static_file_handler.StaticFileHandler'),
    ('/(.+)', 'static_file_handler.StaticFileHandler'),
]

config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'something-very-very-secret',
}

application = webapp2.WSGIApplication(routes=routes, debug=True, config=config)

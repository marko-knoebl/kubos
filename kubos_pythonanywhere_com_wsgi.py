# This file contains the WSGI configuration required to serve up your
# web application at http://kubos.pythonanywhere.com/
# It works by setting the variable 'application' to a WSGI handler of some
# description.

import webapp2
#webapp2.application
routes = [
    # redirect everyting to handlers.HelloWorldHandler
    ('/', 'kubos.KubosBoxesApp'),
    ('/kubos', 'kubos.KubosApp'),
    ('/kubos_boxes', 'kubos.KubosBoxesApp'),
    ('/upload_stl', 'kubos.UploadStl'),
    ('/(.+)', 'static_file_handler.StaticFileHandler'),
]

config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'something-very-very-secret',
}

application = webapp2.WSGIApplication(routes=routes, debug=True, config=config)

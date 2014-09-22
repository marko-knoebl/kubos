"""
For all requestst to kubos.pythonanywhere.com/...
that are not handled by any other handlers we will try to
serve corresponding static files from /var/www/
"""

import webapp2
import os
import mimetypes

class StaticFileHandler(webapp2.RequestHandler):
    def get(self, path):
        abs_path = os.path.abspath(os.path.join('/var/www', path))
        #if os.path.isdir(abs_path) or abs_path.find(os.getcwd()) != 0:
        #    self.response.set_status(403)
        #    raise Exception(10)
        #    return
        try:
            f = open(abs_path, 'r')
            self.response.headers.add_header('Content-Type', mimetypes.guess_type(abs_path)[0])
            self.response.out.write(f.read())
            f.close()
        except:
            self.response.set_status(404)
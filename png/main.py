import cgi
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import memcache, urlfetch
import os
import logging
import urllib
from django.utils import simplejson
from google.appengine.ext import db
import base64
import re

class PngPicture(db.Model):
    data       = db.BlobProperty()

    def path(self):
        return "http://hitode909.appspot.com/png/" + str(self.key()) + ".png"

    @classmethod
    def from_data_uri(self, data):
        r = re.compile('^data:image/png;base64,(.*)$')
        if r.match(data):
            b64 = r.match(data).group(1)
            blob = base64.standard_b64decode(b64)
            pic = PngPicture()
            pic.data = db.Blob(blob)
            pic.put()
            logging.info(pic)
            return pic

class Page(webapp.RequestHandler):
    def post(self):
        if not self.request.get('data'):
            logging.info('no data')
            self.response.set_status(404)
            self.response.out.write('no data')
            return
        
        record = PngPicture.from_data_uri(self.request.get('data'))
        logging.debug(record)
        logging.debug(record.path())
        self.response.headers['Content-Type'] = "text/plain"
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Allow-Headers'] = 'x-requested-with'
        self.response.out.write(record.path())

    def options(self):
        logging.debug("options")
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Allow-Headers'] = 'x-requested-with'
        self.response.out.write('options')
        return

class GetPage(webapp.RequestHandler):
    def get(self, key):
        pic = PngPicture.get(db.Key(key))
        if not pic:
            self.response.set_status(404)
            self.response.out.write('404')
            return
        logging.info(pic)

        self.response.headers['Content-Type'] = "image/png"
        self.response.out.write(pic.data)
        return


application = webapp.WSGIApplication(
                                     [
                                      ('/png/', Page),
                                      ('/png/(.+)\.png', GetPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

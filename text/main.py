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

class TextRecord(db.Model):
    data       = db.TextProperty()

    def path(self):
        return "http://hitode909.appspot.com/text/" + str(self.key())

class Page(webapp.RequestHandler):
    def post(self):
        if not self.request.get('data'):
            logging.info('no data')
            self.response.set_status(404)
            self.response.out.write('no data')
            return

        record = TextRecord()
        record.data = db.Text(self.request.get('data'))
        record.put()
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
        record = TextRecord.get(db.Key(key))
        if not record:
            self.response.set_status(404)
            self.response.out.write('404')
            return
        logging.info(record)

        self.response.headers['Content-Type'] = "text/plain"
        self.response.out.write(record.data)
        return

application = webapp.WSGIApplication(
                                     [
                                      ('/text/', Page),
                                      ('/text/(.+)', GetPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

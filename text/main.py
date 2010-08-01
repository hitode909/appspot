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
    created_on = db.DateTimeProperty(auto_now_add = 1)

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
        logging.info('POST')
        logging.info(self.request.get('data'))
        logging.info(record.path())
        self.response.headers['Content-Type'] = "text/plain"
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Allow-Headers'] = 'x-requested-with'
        self.response.out.write(record.path())

    def options(self):
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Allow-Headers'] = 'x-requested-with'
        self.response.out.write('options')
        return

class GetPage(webapp.RequestHandler):
    def get(self, key):
        try:
            record = TextRecord.get(db.Key(key))
        except db.BadKeyError:
            record = None

        if not record:
            self.response.set_status(404)
            self.response.out.write('404')
            return

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

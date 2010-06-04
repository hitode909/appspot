import cgi
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import memcache, urlfetch
import os
import logging
import urllib
from django.utils import simplejson

class Page(webapp.RequestHandler):
    def post(self):
        url = self.request.get('url')
        params = urllib.urlencode( {
                'url' : self.request.get('url')
                } )
        resource = urlfetch.fetch("http://tinyurl.com/api-create.php", params, urlfetch.POST)
        logging.info(resource.content)
        self.response.out.write(resource.content)

application = webapp.WSGIApplication(
                                     [
                                      ('/tinyurl/', Page),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

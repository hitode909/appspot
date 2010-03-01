import cgi

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from glitch.controller.api import ApiPage
from glitch.controller.api2 import Api2Page

application = webapp.WSGIApplication(
                                     [
                                      ('/glitch/api', ApiPage),
                                      ('/glitch/api2', Api2Page),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

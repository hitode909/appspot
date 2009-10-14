import cgi

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from glitch.controller.api import ApiPage

application = webapp.WSGIApplication(
                                     [
                                      ('/glitch/api', ApiPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

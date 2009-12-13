import cgi

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from public_list.controller.api import GetApiPage, OperationApiPage

application = webapp.WSGIApplication(
                                     [
                                      ('/public_list/api', GetApiPage),
                                      (r'/public_list/api/(.+)/(.+)', OperationApiPage),
                                      ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

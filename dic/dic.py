import cgi

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from dic.controller.api import WordPage,WordsPage
from dic.controller.index import IndexPage

application = webapp.WSGIApplication(
                                     [
                                      ('/dic/api/words', WordsPage),
                                      ('/dic/api/word', WordPage),
                                      ('/dic/', IndexPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

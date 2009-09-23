import cgi

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from dic.controller.api import WordPage,WordsPage

application = webapp.WSGIApplication(
                                     [
                                      ('/dic/api/words', WordsPage),
                                      ('/dic/api/word', WordPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

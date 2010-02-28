from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from color.handlers import *

def main():
    application = webapp.WSGIApplication(
        [
            ('/color/random', RandomPage),
            ],
        debug=True)
    run_wsgi_app(application)

if __name__ == "__main__":
        main()


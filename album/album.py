from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from album.handlers import *

def main():
    application = webapp.WSGIApplication(
        [
            ('/album/preview', PreviewPage),
            ('/album/(.+)/api', ApiPage),
            ('/album/(.+)/', AlbumPage),
            ],
        debug=True)
    run_wsgi_app(application)

if __name__ == "__main__":
        main()


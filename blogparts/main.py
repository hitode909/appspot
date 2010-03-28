import cgi
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template

class BlogPartsHelper(webapp.RequestHandler):
    def foo(self):
        logging.info('foo')

class CounterPage(BlogPartsHelper):
    def get(self):
        title = self.request.get('title')
        if not title:
            title = 'default'
        template_values = {
            'title': title
            }
        path = os.path.join(os.path.dirname(__file__), 'view', 'counter.xml')
        result = template.render(path, template_values)
        self.response.out.write(result)
        self.response.headers['Content-Type'] = 'application/xml'

application = webapp.WSGIApplication(
                                     [
                                      ('/blogparts/wmc_counter', CounterPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

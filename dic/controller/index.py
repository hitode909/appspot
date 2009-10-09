from google.appengine.ext import webapp
from dic.model import Word
import os
from google.appengine.ext.webapp import template

class IndexPage(webapp.RequestHandler):
  def get(self):

    template_values = {
      'words': Word.all().fetch(1000)
      }

    path = os.path.join(os.path.dirname(__file__), '..', 'view', 'index.html')
    self.response.out.write(template.render(path, template_values))


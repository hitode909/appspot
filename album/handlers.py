import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util, template
from models import *

class ApiPage(webapp.RequestHandler):
    def get(self):
        self.response.out.write("\n".join([photo.path for photo in Photo.all().order('-created_on').fetch(1000)]))

    def post(self):
        path = self.request.get('path')
        if not path:
            self.response.out.write('path is required')
            self.error(400)
            return
        photo = Photo.get_or_insert(path, path = path)
        self.response.out.write(photo.path)
        
    def delete(self):
        path = self.request.get('path')
        if not path:
            self.response.out.write('path is required')
            self.error(400)
            return
        photo = Photo.get_by_key_name(path)
        if not photo:
            self.response.out.write('not found')
            self.error(404)
            return
        self.response.out.write(photo.path)

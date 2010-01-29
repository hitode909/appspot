import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util, template
from google.appengine.api import images
from models import *
import re
from proxy.proxy import ProxyHelper

class PreviewPage(ProxyHelper):
    def get(self):
        url = self.request.get('url')
        if not url:
            self.error(400)
            self.response.out.write('url is required')
            return

        size = self.request.get('size')
        if size:
            size = int(size)
        else:
            size = 100

        resource = self.get_resource(url)
        converter = images.Image(resource['content'])
        converter.resize(width=size, height=size)
        resource['headers']['content-type'] = 'image/jpeg'
        for k, v in resource["headers"].iteritems():
            self.response.headers[k] = v
        self.response.out.write(converter.execute_transforms(output_encoding=images.JPEG))

class AlbumPage(webapp.RequestHandler):
    def get(self, album_name):
        template_values = {
            'album_name':   album_name
            }
        path = os.path.join(os.path.dirname(__file__), 'view', 'index.html')
        result = template.render(path, template_values)
        self.response.out.write(result)


class ApiPage(ProxyHelper):
    def photo_key(self, album_name, photo_url):
        return album_name + '-' + photo_url

    def get(self, album_name):
        album = Album.get_by_key_name(album_name)
        if not album:
            self.response.out.write("")
            return
        self.response.out.write("\n".join([photo.url for photo in album.photos]))

    def post(self, album_name):
        album = Album.get_or_insert(album_name, name = album_name)
        photo_url = self.request.get('photo_url')
        if not photo_url:
            self.error(400)
            self.response.out.write('photo_url is required')
            return
        resource = self.get_resource(photo_url)
        if not re.compile("^image").match(resource['headers']['content-type']):
            resource = self.fetch_resource(photo_url) # try again
            if not re.compile("^image").match(resource['headers']['content-type']):
                self.response.set_status(400)
                self.response.out.write("not image")
                return
        
        photo = Photo.get_or_insert(self.photo_key(album_name, photo_url), url = photo_url, album = album)
        self.response.out.write("ok")
        
    def delete(self, album_name):
        photo_url = self.request.get('photo_url')
        if not photo_url:
            self.response.out.write('photo_url is required')
            self.error(400)
            return
        photo = Photo.get_by_key_name(self.photo_key(album_name, photo_url))
        if not photo:
            self.response.out.write('not found')
            self.error(404)
            return
        photo.delete()
        self.response.out.write("ok")

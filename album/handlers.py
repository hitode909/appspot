import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util, template
from google.appengine.api import images, urlfetch
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
    def photo_key(self, album_name, url):
        return album_name + '-' + url

    def get(self, album_name):
        album = Album.get_by_key_name(album_name)
        if not album:
            self.response.out.write("")
            return
        self.response.out.write("\n".join([photo.url for photo in album.photos]))

    def post(self, album_name):
        album = Album.get_or_insert(album_name, name = album_name)
        url = self.request.get('url')
        if not url:
            self.error(400)
            self.response.out.write('url is required')
            logging.info("failed posting to %s because no url" % (album_name))
            return
        try:
            resource = self.get_resource(url)
        except urlfetch.Error, e:
            self.error(400)
            self.response.out.write('failed to fetch')
            logging.info("error %s, %s" % (url, e))
            return
            
        if resource['status_code'] != 200 or not re.compile("^image").match(resource['headers']['content-type']):
            # resource = self.fetch_resource(url) # try again
            if resource['status_code'] != 200 or not re.compile("^image").match(resource['headers']['content-type']):
                self.response.set_status(400)
                self.response.out.write("not image")
                logging.info("failed posting to %s %s because not image" % (album_name, url))
                logging.info(resource['status_code'])
                logging.info(resource['headers']['content-type'])
                return
        logging.info("post %s to %s" % (url, album_name))
        photo = Photo.get_or_insert(self.photo_key(album_name, url), url = url, album = album)
        self.response.out.write("ok")
        
    def delete(self, album_name):
        url = self.request.get('url')
        if not url:
            self.response.out.write('url is required')
            self.error(400)
            return
        photo = Photo.get_by_key_name(self.photo_key(album_name, url))
        if not photo:
            self.response.out.write('not found')
            logging.info("failed to delete %s %s because not found" % (album_name, url))
            self.error(404)
            return
        photo.delete()
        logging.info("delege %s from %s" % (url, album_name))
        self.response.out.write("ok")

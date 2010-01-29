import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util, template
from google.appengine.api import images, urlfetch
from models import *
import re
from proxy.proxy import ProxyHelper
from google.appengine.runtime import apiproxy_errors

class AlbumsPage(webapp.RequestHandler):
    def get(self):
        template_values = {
            'albums': Album.all().order('-created_on').fetch(1000)
            }
        path = os.path.join(os.path.dirname(__file__), 'view', 'albums.html')
        result = template.render(path, template_values)
        self.response.out.write(result)

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
        resized_key = url + '-resized-' + str(size)
        resource = self.load_resource(resized_key)
        if resource:
            logging.info('load resized resource')
        else:
            resource = self.get_resource(url)
            converter = images.Image(resource['content'])
            converter.resize(width=size, height=size)
            try:
                logging.info('resizing')
                content = converter.execute_transforms(output_encoding=images.JPEG)
                resource['content'] = content
                self.save_resource(resized_key, resource)
                logging.info('save resized resource')
            except apiproxy_errors.OverQuotaError, message:
                logging.error(message)
                logging.info('avoid error')

        resource['headers']['content-type'] = 'image/jpeg'
        for k, v in resource["headers"].iteritems():
            self.response.headers[k] = v
        self.response.out.write(resource['content'])

class AlbumPage(webapp.RequestHandler):
    def get(self, album_name):
        template_values = {
            'album_name':   album_name,
            'posting_url':  self.request.get('post')
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
        mode = self.request.get('mode')
        if mode and mode == 'deleted':
            photos = album.deleted_photos_in_order()
        else:
            photos = album.photos_in_order()
        self.response.out.write("\n".join([photo.url for photo in photos]))

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
        photo = Photo.get_or_insert(self.photo_key(album_name, url), url = url, album = album, availeble = True)
        if self.request.get('redirect'):
            self.redirect(album.root_url)
        else:
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
        photo.available = False
        photo.put()
        logging.info("delege %s from %s" % (url, album_name))
        self.response.out.write("ok")

import logging
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import memcache, urlfetch, images
from django.utils import simplejson
import base64
import random
import hashlib
import re

class Api2Page(webapp.RequestHandler):
    def get(self):
        uri = self.request.get('uri')
        try:
            image = self.get_image(uri)
        except (urlfetch.InvalidURLError), inst:
            self.response.set_status(400)
            if self.request.get('uri'):
                self.response.out.write("uri is invalid.")
            else:
                self.response.out.write("uri is required.")
            return
        except (urlfetch.DownloadError), inst:
            self.response.set_status(400)
            self.response.out.write("failed to download.")
            return
        if image['status_code'] != 200:
            self.response.set_status(400)
            self.response.out.write("failed to download.")
            return
        if not re.compile("^image").match(image['headers']['content-type']):
            self.response.set_status(400)
            self.response.out.write("not image")
            return

        if image['headers']['content-type'] != 'image/jpeg':
            converter = images.Image(image['content'])
            converter.rotate(0)
            image['content'] = converter.execute_transforms(output_encoding=images.JPEG)
            image['headers']['content-type'] = 'image/jpeg'
            self.save_image(uri, image)
            logging.info("image converted (%s)" % (uri))

        glitched_content = self.slice_glitch(image['content'])
            
        self.response.headers['Content-Type'] = image['headers']['content-type']
        self.response.out.write(glitched_content)
        return

    def get_image(self, uri):
        image = self.load_image(uri)
        if image: return image

        image = self.fetch_image(uri)
        self.save_image(uri, image)
        return image

    def fetch_image(self, uri):
        image = urlfetch.fetch(uri)
        headers = {}
        for key in image.headers.keys(): headers[key] = image.headers[key]
        
        return {"content": image.content, "status_code": image.status_code, "headers": headers}
    
    def load_image(self, uri):
        image = memcache.get(uri, "fetched_image")
        if not image: return None
        logging.debug("image cache hit(%s)" % (uri))
        image = simplejson.loads(image)
        image["content"] = base64.standard_b64decode(image["content"])
        return image

    def save_image(self, uri, image):
        save = image.copy()
        save["content"] = base64.standard_b64encode(image["content"])
        memcache.set(uri, simplejson.dumps(save), 3600, 0, "fetched_image")
        logging.info("image cache set(%s)" % (uri))

    def slice_glitch(self, source):
        content = ''
        length = len(source)
        logging.info("total %s" % length)
        slice_length = int((random.random() + random.random()) / 7 * length)
        while len(content) < len(source):
            if len(content) > 0:
                cut_from   = int(random.random() * length)
                cut_length = int((random.random() + random.random()) / 6 * length)
                cut_length = slice_length
            else:
                cut_from   = 0
                cut_length = int((1 + random.random() ) / 6 * length)

            logging.info("slice %s to %s", cut_from, cut_from + cut_length)
            content += source[cut_from:cut_from+cut_length]
            while cut_from > 0 and random.random() < 0.7 and len(content) < len(source):
                content += source[cut_from:cut_from+cut_length]
        return content


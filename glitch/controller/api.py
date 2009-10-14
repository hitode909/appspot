import logging
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import memcache, urlfetch, images
from django.utils import simplejson
import base64
import random
import hashlib
import re

class ApiPage(webapp.RequestHandler):
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

        keys = self.request.arguments()
        keys.remove('uri')
        glitch_rule = {}
        for key in keys: glitch_rule[key] = self.request.get(key)
        if len(glitch_rule) == 0:
            glitch_rule = self.random_glitch_rule()
        glitched_content = self.glitch(image['content'], glitch_rule)


            
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

    def random_glitch_rule(self):
        rule = {}
        seed = hashlib.sha1(str(random.random())).hexdigest()
        for i in range(int(random.random()*2+1)):
            a = int(random.random()*3+1)
            b = int(random.random()*3+1)
            rule[seed[:a]] = seed[a:a+b]
            seed = seed[a+b:]
        logging.debug("random rule generated(%s)", str(rule))
        return rule
        
    def glitch(self, image, rule):
        for key in rule.keys():
            image = image.replace(key.encode('ascii'), rule[key].encode('ascii'))
        return image

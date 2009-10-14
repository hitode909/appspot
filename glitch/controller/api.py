import logging
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import memcache, urlfetch
from django.utils import simplejson
import base64
import random

class ApiPage(webapp.RequestHandler):
    def get(self):
        uri = self.request.get('uri')
        image = self.get_image(uri)
        
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
        if not uri: raise Exception, '/glitch/api?uri=URI&FROM=TO' 
        
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
        memcache.set(uri, simplejson.dumps(save), 600, 0, "fetched_image")
        logging.info("image cache set(%s)" % (uri))

    def random_glitch_rule(self):
        rule = {}
        for i in range(int(random.random()*3+1)):
            rule[str(int(random.random()*100))] = str(int(random.random()*100))
        logging.debug("random rule generated(%s)", str(rule))
        return rule
        
    def glitch(self, image, rule):
        for key in rule.keys():
            image = image.replace(key.encode('ascii'), rule[key].encode('ascii'))
        return image

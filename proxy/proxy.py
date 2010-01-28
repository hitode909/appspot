import cgi
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import memcache, urlfetch, images
import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
import urllib
import base64
from django.utils import simplejson

class ProxyHelper(webapp.RequestHandler):
    def get_resource(self, uri):
        resource = self.load_resource(uri)
        if resource: return resource

        resource = self.fetch_resource(uri)
        self.save_resource(uri, resource)
        return resource

    def fetch_resource(self, uri):
        resource = urlfetch.fetch(uri)
        headers = {}
        for key in resource.headers.keys(): headers[key] = resource.headers[key]
        
        return {"content": resource.content, "status_code": resource.status_code, "headers": headers}
    
    def load_resource(self, uri):
        resource = memcache.get(uri, "fetched_resource")
        if not resource: return None
        logging.debug("resource cache hit(%s)" % (uri))
        resource = simplejson.loads(resource)
        resource["content"] = base64.standard_b64decode(resource["content"])
        return resource

    def save_resource(self, uri, resource):
        save = resource.copy()
        save["content"] = base64.standard_b64encode(resource["content"])
        memcache.set(uri, simplejson.dumps(save), 3600, 0, "fetched_resource")
        logging.info("resource cache set(%s)" % (uri))

class ProxyPage(ProxyHelper):
    def get(self, path):
        path = urllib.unquote(path)
        resource = self.get_resource(path)
        for k, v in resource["headers"].iteritems():
            self.response.headers[k] = v
        self.response.out.write(resource["content"])

application = webapp.WSGIApplication(
                                     [
                                      ('/proxy/(.*)', ProxyPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

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
        memcache.set(uri, simplejson.dumps(save), 3600 * 6, 0, "fetched_resource")
        logging.info("resource cache set(%s)" % (uri))

class ThumbPage(ProxyHelper):
    def get(self, query):
        # thumbnail url cache hit?
        group = 'thumbnail_url'
        cached_url = memcache.get(query, group)
        if cached_url:
            logging.info("cache for url hit")
            self.redirect(cached_url)
            return

        # urlfetch with caching
        resource = self.get_resource('http://gdata.youtube.com/feeds/api/videos?alt=json&v=2&q=' + urllib.unquote(query))
        feed = simplejson.loads(resource["content"])

        # select entry
        if not feed.has_key('feed'):
            self.response.out.write('not found')
            self.response.set_status(404)
            return
        if not feed['feed'].has_key('entry'):
            self.response.out.write('not found')
            self.response.set_status(404)
            return
        entries = feed['feed']['entry']
        entry = entries[0]

        # select biggest thumbnail
        thumbnails = entry['media$group']['media$thumbnail']
        selected_thumbnail = thumbnails[0]
        for thumbnail in thumbnails:
            if thumbnail['height'] * thumbnail['width'] > selected_thumbnail['width'] * selected_thumbnail['height']:
                selected_thumbnail = thumbnail

        # set cache
        redirect_to = selected_thumbnail['url']
        memcache.set(query, redirect_to, 3600 * 6, 0, group)

        # redirect
        self.redirect(redirect_to)

application = webapp.WSGIApplication(
                                     [
                                      ('/thumbnail.to/(.*)', ThumbPage),
                                     ],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()

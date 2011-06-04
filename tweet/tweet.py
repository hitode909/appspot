import os
import logging
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util, template
from google.appengine.api import images, urlfetch
import re
from proxy.proxy import ProxyHelper
from google.appengine.runtime import apiproxy_errors
from datetime import datetime
import sys
from os.path import dirname, join as join_path
sys.path.insert(0, join_path(dirname(__file__), '..', 'oauth')) # extend sys.path
from oauth_handler import OAuthClient
from google.appengine.ext.webapp import RequestHandler, WSGIApplication
from wsgiref.handlers import CGIHandler
from django.utils import simplejson

class TweetPage(webapp.RequestHandler):
    def get(self):
        client = OAuthClient('twitter', self)
        if client.get_cookie():
            info = client.get('/account/verify_credentials')

            template_values = {
                'screen_name': info['screen_name'],
                }
            path = os.path.join(os.path.dirname(__file__), 'view.html')
            result = template.render(path, template_values)
            self.response.out.write(result)
        else:
            path = os.path.join(os.path.dirname(__file__), 'login.html')
            result = template.render(path, { })
            self.response.out.write(result)

    def post(self):
        status = self.request.get('status')
        if not status:
            self.error(400)
            self.response.out.write('status required')
            return

        client = OAuthClient('twitter', self)
        if not client.get_cookie():
            self.error(400)
            self.response.out.write('login required')
            return

        res = client.post("https://api.twitter.com/1/statuses/update.json", status = status)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(simplejson.dumps(res))

def main():

    application = WSGIApplication([
            ('/tweet/', TweetPage)
       ], debug=True)

    CGIHandler().run(application)

if __name__ == '__main__':
    main()

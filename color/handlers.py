import os
import logging
from google.appengine.ext import webapp
import random
import yaml
import base64
import sys

class RandomPage(webapp.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'image/png'
        dic = self.data()
        self.response.out.write(
            base64.standard_b64decode(
                dic['pre'] +
                dic['mid'][int(random.random()*len(dic['mid']))] +
                dic['post']
                )
            )

    def data(self):
        return yaml.load(open('setting.yml').read())

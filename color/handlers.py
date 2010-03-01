import os
import logging
from google.appengine.ext import webapp
import random
import yaml
import base64
import sys
from google.appengine.api import images

class ColorHelper(webapp.RequestHandler):
    def random_data(self):
        colors = self.colors()
        return base64.standard_b64decode(
            colors[int(random.random()*len(colors))]
            )

    def colors(self):
        return yaml.load(open('setting.yml').read())

class VividPage(ColorHelper):
    def get(self):
        image = self.random_data()
        self.response.headers['Content-Type'] = 'image/png'
        self.response.out.write(image)

class RandomPage(ColorHelper):
    def get(self):
        image_list = [(self.random_data(), 0, 0, 0.5 + (random.random()/2.0), images.TOP_LEFT,)]

        a = 0
        r = int(random.random()*255)
        g = int(random.random()*255)
        b = int(random.random()*255)
        color = (a * 255 * 255 * 255) + (r * 255 * 255) + (g * 255) + b

        image = images.composite(image_list, 100, 100, color)
        self.response.headers['Content-Type'] = 'image/png'
        self.response.out.write(image)


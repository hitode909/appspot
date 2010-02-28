import os
import logging
from google.appengine.ext import webapp
import random

class RandomPage(webapp.RequestHandler):
    def get(self):
        bits = ["0", "8", "F"]
        file = "/color/"
        file += bits[int(random.random()*len(bits))]
        file += bits[int(random.random()*len(bits))]
        file += bits[int(random.random()*len(bits))]
        file += ".png"

        self.redirect(file)

from google.appengine.ext import db

class Photo(db.Model):
    path     = db.StringProperty()
    created_on = db.DateTimeProperty(auto_now_add = 1)

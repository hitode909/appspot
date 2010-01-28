from google.appengine.ext import db

class Album(db.Model):
    name       = db.StringProperty(required=True)
    created_on = db.DateTimeProperty(auto_now_add = 1)

class Photo(db.Model):
    album      = db.ReferenceProperty(Album,
                                      required=True,
                                      collection_name='photos')
    url        = db.StringProperty()
    created_on = db.DateTimeProperty(auto_now_add = 1)

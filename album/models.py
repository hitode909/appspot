from google.appengine.ext import db
import urllib

class Album(db.Model):
    name       = db.StringProperty(required=True)
    created_on = db.DateTimeProperty(auto_now_add = 1)

    def root_url(self):
        return '/album/' + urllib.quote(self.name) + '/'

    def photos_in_order(self):
        return Photo.gql("where album = :1 and available = TRUE order by created_on asc", self.key())

    def deleted_photos_in_order(self):
        return Photo.gql("where album = :1 and available = FALSE order by created_on asc", self.key())


class Photo(db.Model):
    album      = db.ReferenceProperty(Album,
                                      required=True,
                                      collection_name='photos')
    url        = db.StringProperty()
    created_on = db.DateTimeProperty(auto_now_add = 1)
    available  = db.BooleanProperty(default = True)

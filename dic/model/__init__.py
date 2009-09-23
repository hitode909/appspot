from google.appengine.ext import db

class Word(db.Model):
  name = db.StringProperty()
  created_at = db.DateTimeProperty(auto_now_add=True)
  modified_at = db.DateTimeProperty(auto_now_add=True) #XXX

  def to_hash(self):
    return { "name": self.name,
        "description" : [d.to_hash() for d in self.descriptions()] }

  def descriptions(self):
    return Description.gql("WHERE word = :1", self.key()).fetch(1000) #XXX limit 1000 descriptions

  def add_description(self, body):
    if not body: return
    desc = Description(body=body, word=self)
    desc.put()

  def get_description(self, key):
    desc = Description.get(db.Key(key)) #XXX db.get?
    if not desc: return None
    if desc.word == self:
      return desc
    else:
      return None

  @classmethod
  def get_by_name(cls, name):
    return cls.gql("WHERE name = :1", name).get();

  @classmethod
  def get_or_insert_by_name(cls, name):
    word = cls.gql("WHERE name = :1", name).get();
    if not word:
      word = Word(name=name)
      word.put()
    return word


class Description(db.Model):
  body = db.StringProperty()
  word = db.ReferenceProperty(Word)
  created_at = db.DateTimeProperty(auto_now_add=True)
  modified_at = db.DateTimeProperty(auto_now_add=True) #XXX

  def to_hash(self):
    return { "body": self.body,
        "key" : str(self.key()) }


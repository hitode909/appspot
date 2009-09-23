from google.appengine.ext import webapp
from google.appengine.ext import db
from django.utils import simplejson
from dic.model import Word,Description

class WordsPage(webapp.RequestHandler):
  def get(self):
    self.response.content_type = "application/json"
    simplejson.dump( {"words": [ w.name for w in Word.all().fetch(1000) ]},
        self.response.out,
        ensure_ascii=False)


class WordPage(webapp.RequestHandler):
  def get(self):
    word_name = self.request.get('word')
    if not word_name:
      self.response.set_status(404)
      self.response.out.write('word is empty')
      return
    word = Word.get_by_name(word_name)
    if not word:
      self.response.set_status(404)
      self.response.out.write('word not found')
      return

    self.response.content_type = "application/json"
    simplejson.dump({"word": word.to_hash()}, self.response.out, ensure_ascii=False)

  def post(self):
    word_name = self.request.get('word')
    if not word_name:
      self.response.set_status(404)
      self.response.out.write('word is empty')
      return
    description_body = self.request.get('description')
    word = Word.get_or_insert_by_name(word_name)

    if description_body:
      word.add_description(description_body)

    self.response.content_type = "application/json"
    simplejson.dump({"word": word.to_hash()}, self.response.out, ensure_ascii=False)

  def delete(self):
    word_name = self.request.get('word')
    if not word_name:
      self.response.set_status(404)
      self.response.out.write('word is empty')
      return 
    description_key = self.request.get('key')
    if not description_key:
      self.response.set_status(404)
      self.response.out.write('key is empty')
      return
    word = Word.get_by_name(word_name)
    if not word:
      self.response.set_status(404)
      self.response.out.write('word not found')
      return

    desc = word.get_description(description_key)
    if not desc:
      self.response.set_status(404)
      self.response.out.write('description not found')
      return

    desc.delete()

    self.response.content_type = "application/json"
    simplejson.dump({"word": word.to_hash()}, self.response.out, ensure_ascii=False)


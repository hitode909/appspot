import logging
from google.appengine.ext import webapp
from google.appengine.ext import db
from google.appengine.api import memcache
from django.utils import simplejson
from dic.model import Word,Description

class WordsPage(webapp.RequestHandler):
  def get(self):
    result = memcache.get("words")
    if not result:
      result = simplejson.dumps(
        {"words": [ w.name for w in Word.all().fetch(1000) ]},
        ensure_ascii=False)
      memcache.add("words", result)
    
    self.response.content_type = "application/json"
    self.response.out.write(result)
    return

class WordPage(webapp.RequestHandler):
  def get(self):
    word_name = self.request.get('word')
    if not word_name:
      self.response.set_status(404)
      self.response.out.write('word is empty')
      return
    result = memcache.get("word-" + word_name)
    if not result:
      word = Word.get_by_name(word_name)
      if not word:
        self.response.set_status(404)
        self.response.out.write('word not found')
        return
      result = simplejson.dumps({"word": word.to_hash()}, ensure_ascii=False)
      memcache.add("word-" + word_name, result)
    
    self.response.content_type = "application/json"
    self.response.out.write(result)
    return

  def post(self):
    word_name = self.request.get('word')
    if not word_name:
      self.response.set_status(404)
      self.response.out.write('word is empty')
      return
    description_body = self.request.get('description')
    word = Word.get_or_insert_by_name(word_name)
    if not word:
      self.response.set_status(404)
      self.response.out.write('word not found')
      return

    if description_body:
      word.add_description(description_body)
      memcache.delete("words")

    result = simplejson.dumps({"word": word.to_hash()}, ensure_ascii=False)
    memcache.add("word-" + word_name, result)

    logging.info("description add(%s, %s)" % (word.name, description_body))
    self.response.content_type = "application/json"
    self.response.out.write(result)
    return

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

    logging.info("description delete(%s, %s)" % (word.name, desc.body))
    desc.delete()
    result = simplejson.dumps({"word": word.to_hash()}, ensure_ascii=False)
    memcache.add("word-" + word_name, result)
    
    self.response.content_type = "application/json"
    self.response.out.write(result)
    return

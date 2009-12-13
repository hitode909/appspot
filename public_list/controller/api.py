import logging
from google.appengine.ext import webapp
from google.appengine.api import memcache, urlfetch
from django.utils import simplejson

class GetApiPage(webapp.RequestHandler):
    def get(self):
        groups_cache = memcache.get("groups", "public_list")
        if groups_cache:
            logging.debug('get groups from cache')
            self.response.out.write(groups_cache)
        else:
            logging.debug('set groups from mock')
            groups = {
                "fse": ["hakobe", "isano", "opopo"],
                "music": ["kohmi", "mochilon", "tofubeats"]
                }
            dumped_cache = simplejson.dumps(groups, ensure_ascii=False)
            memcache.set('groups', dumped_cache, time=0, namespace="public_list")
            self.response.out.write(dumped_cache)
        
        self.response.headers['Content-Type'] = "application/json"
        return

class OperationApiPage(webapp.RequestHandler):
    def put(self, group, user):
        groups_cache = memcache.get("groups", "public_list")
        if groups_cache:
            groups = simplejson.loads(groups_cache)
        else:
            groups = {}
        users = groups.setdefault(group, [])
        if user not in users:
            users.append(user)
            logging.debug('append ' + user + ' to ' + group)
        dumped_cache = simplejson.dumps(groups, ensure_ascii=False)
        memcache.set('groups', dumped_cache, time=0, namespace="public_list")
        self.response.out.write(dumped_cache)
        self.response.headers['Content-Type'] = "application/json"
        return

    def delete(self, group, user):
        groups_cache = memcache.get("groups", "public_list")
        if groups_cache:
            groups = simplejson.loads(groups_cache)
        else:
            groups = {}
        users = groups.setdefault(group, [])
        if user in users:
            users.remove(user)
            logging.debug('delete ' + user + ' from ' + group)
        dumped_cache = simplejson.dumps(groups, ensure_ascii=False)
        memcache.set('groups', dumped_cache, time=0, namespace="public_list")
        self.response.out.write(dumped_cache)
        self.response.headers['Content-Type'] = "application/json"
        return

# -*- coding: utf-8 -*-

import json
from Products.Five.browser import BrowserView
from plone import api


class GrabApiKeyView(BrowserView):

    def __call__(self, *args, **kwargs):
        self.request.response.setHeader(
            'Content-Type', 'application/json'
        )
        key = api.portal.get_registry_record(
            'plone.formwidget.geolocation.api_key'
        )
        return json.dumps({
            'key': key
        })

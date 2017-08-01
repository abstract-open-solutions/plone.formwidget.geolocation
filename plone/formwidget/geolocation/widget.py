# -*- coding: utf-8 -*-

from plone import api
from plone.formwidget.geolocation.interfaces import IGeolocationField
from plone.formwidget.geolocation.interfaces import IGeolocationWidget
from z3c.form.browser.text import TextWidget
from z3c.form.interfaces import IFieldWidget, IFormLayer
from z3c.form.widget import FieldWidget
from zope.component import adapter, queryMultiAdapter
from zope.interface import implementer, implementsOnly


class GeolocationWidget(TextWidget):
    implementsOnly(IGeolocationWidget)

    klass = u'geolocation-widget'
    value = None

    def update(self):
        super(GeolocationWidget, self).update()
        if self.value is None and self.mode == 'input':
            self.value = self._default_loc()

    def _default_loc(self):
        default_loc = api.portal.get_registry_record(
            'plone.formwidget.geolocation.default_location'
        )
        return (default_loc['lat'], default_loc['lng'], default_loc['zoom'])


@implementer(IFieldWidget)
@adapter(IGeolocationField, IFormLayer)
def GeolocationFieldWidget(field, request):
    return FieldWidget(field, GeolocationWidget(request))

from plone.formwidget.geolocation import _
from z3c.form.interfaces import IWidget
from zope import schema
from zope.interface import Interface
from zope.schema.interfaces import IObject


class IGeolocation(Interface):
    latitude = schema.Float(title=_(u'Latitude'))
    longitude = schema.Float(title=_(u'Longitude'))


class IGeolocationField(IObject):
    pass


class IGeolocationWidget(IWidget):
    pass

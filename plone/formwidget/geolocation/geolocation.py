from plone.formwidget.geolocation.interfaces import IGeolocation
from zope.interface import implements


class Geolocation(object):
    implements(IGeolocation)

    def __init__(self, latitude=0, longitude=0, zoom=12):
        self.latitude = float(latitude)
        self.longitude = float(longitude)
        self.zoom = float(zoom)

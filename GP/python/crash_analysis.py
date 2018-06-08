#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      calebma
#
# Created:     06/04/2018
# Copyright:   (c) calebma 2018
# Licence:     <your licence>
#-------------------------------------------------------------------------------
# package info
__author__ = 'Caleb Mackey'
__organization__ = 'Bolton & Menk, Inc.'
__author_email__ = 'calebma@bolton-menk.com'
__version__ = '0.1'

import os
import arcpy
import restapi
import json
import sys

# network share
sys.path.append(r'\\arcserver1\GIS\_Resources\ESRI\Python\BMI_Library\GeoprocessingServices\demo\python')
from utils import featureToPointPolyfill

DEFAULT_CRASH_URL = 'https://gis.iowadot.gov/public/rest/services/Traffic_Safety/Crash_Data/MapServer/0'

@utils.timeit
def summarize_crashes(buffs, out_features=arcpy.CreateUniqueName('crash_summary', 'in_memory'), crash_service_url=DEFAULT_CRASH_URL):
    """downloads and summarizes crash information within buffered intersections

    Required:
        buffs -- intersection buffers
        out_features -- output features
        crash_service_url -- IOWA DOT Crash REST Service url
    """
    # dissolve buffers for REST API query
    dis = arcpy.CreateUniqueName('buff_dis', 'in_memory')
    arcpy.management.Dissolve(buffs, dis)

    # custom module: get layer from REST service
    lyr = restapi.MapServiceLayer(crash_service_url)

    # get geometry as JSON
    g = restapi.Geometry(dis)

    # query REST Service
    fs = lyr.query(geometry=g)
    crashes = arcpy.CreateUniqueName('crashes', 'in_memory')

    # export feature set
    restapi.exportFeatureSet(fs, crashes)

    # crash summary fields
    crash_sum_fields = ['FATALITIES', 'INJURIES', 'MAJINJURY',
                 'MININJURY', 'POSSINJURY', 'UNKINJURY',
                 'PROPDMG', 'VEHICLES', 'TOCCUPANTS']

    # create field map for spatial join
    fms = arcpy.FieldMappings()
    fms.addTable(buffs)
    fms.addTable(crashes)

    # set field map merge option to 'Sum' to summarize crash results per intersection buffer
    for field_name in crash_sum_fields:
        fi = fms.findFieldMapIndex(field_name)
        field = fms.getFieldMap(fi)
        field.mergeRule = 'Sum'

        # update field map
        fms.replaceFieldMap(fi, field)

    # do spatial join
    arcpy.analysis.SpatialJoin(buffs, crashes, out_features, field_mapping=fms)
    return out_features

def crashes_as_json(buffs):
    """prepares crashes for GP Service by converting output to points as FeatureSet()

    Required:
        buffs -- intersection buffers
    """
    crashes = summarize_crashes(buffs)

    # convert summarized buffer polygons to points
    points = arcpy.CreateUniqueName('CrashPoints', 'in_memory')

    # arcpy.FeatureToPoint requires advanced license,use polyfill so it's not required at ArcGIS Server level
    featureToPointPolyfill(crashes, points)

    # convert to JSON
    arcpy.SetParameter(1, arcpy.FeatureSet(points))

if __name__ == '__main__':

    # run tool with unpacked args
    crashes_as_json(arcpy.GetParameter(0))

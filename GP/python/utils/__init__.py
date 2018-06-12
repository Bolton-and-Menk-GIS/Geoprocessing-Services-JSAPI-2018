#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      calebma
#
# Created:     23/05/2016
# Copyright:   (c) calebma 2016
# Licence:     <your licence>
#-------------------------------------------------------------------------------
from __future__ import print_function
import datetime
import os
import re
import sys
import arcpy
import shutil
import fnmatch
import operator
import datetime
import json
import time

# deltas
deltas = ['days', 'months', 'years', 'weeks', 'hours', 'minutes', 'seconds']

def remove_folders(path, exclude=[], older_than=True, test=False, subdirs=True, del_gdb=True, **kwargs):
    """removes old folders within a certain amount of days from today

    Required:
        path -- root directory to delete folders from
        days -- number of days back to delete from.  Anything older than
            this many days will be deleted. Default is 1 day.

    Optional:
        exclude -- list of folders to skip over (supports wildcards).
            These directories will not be removed.
        older_than -- option to remove all folders older than a certain
            amount of days. Default is True.  If False, will remove all
            folders within the last N days.
        test -- Default is False.  If True, performs a test folder iteration,
            to print out the mock results and does not actually delete folders.
        subdirs -- iterate through all sub-directories. Default is False.
        del_gdb -- delete file geodatabases. Default is False
    """
    # if not kwargs, default to delete things older than one day
    time_args = {}
    for k,v in kwargs.iteritems():
        if k in deltas:
            time_args[k] = v
    if not time_args:
        time_args['days'] = 1

    # get removal date and operator
    remove_after = datetime.datetime.now() - datetime.timedelta(**time_args)
    op = operator.lt
    if not older_than:
        op = operator.gt

    # optional test
    if test:
        def remove(*args): pass
    else:
        def remove(*args):
            shutil.rmtree(args[0], ignore_errors=True)

    # walk thru directory
    for root, dirs, files in os.walk(path):
        for d in dirs:
            if not d.endswith('.gdb'):
                folder = os.path.join(root, d)
                if not any(map(lambda ex: fnmatch.fnmatch(d, ex), exclude)):
                    last_mod = datetime.datetime.fromtimestamp(os.path.getmtime(os.path.join(root, d)))

                    # check date
                    if op(last_mod, remove_after):
                        try:
                            remove(os.path.join(root, d))
                            print('deleted: "{0}"'.format(folder))
                        except:
                            print('\nCould not delete: "{0}"!\n'.format(folder))
                    else:
                        print('skipped: "{0}"'.format(folder))
                else:
                    print('excluded: "{0}"'.format(folder))
            else:
                gdb = os.path.join(root, d)
                if del_gdb and test not in (False, 0, None, 'false'):  #explicit!
                    arcpy.management.Delete(gdb)
                    print('deleted geodatabase: "{0}"'.format(gdb))
                else:
                    print('excluded geodatabase: "{0}"'.format(gdb))

        # break or continue if checking sub-directories
        if not subdirs:
            break

    return

def remove_files(path, exclude=[], older_than=True, test=False, subdirs=False, **kwargs):
    """removes old folders within a certain amount of days from today

    Required:
        path -- root directory to delete files from
        days -- number of days back to delete from.  Anything older than
            this many days will be deleted. Default is 1 days.

    Optional:
        exclude -- list of folders to skip over (supports wildcards).
            These directories will not be removed.
        older_than -- option to remove all folders older than a certain
            amount of days. Default is True.  If False, will remove all
            files within the last N days.
        test -- Default is False.  If True, performs a test folder iteration,
            to print out the mock results and does not actually delete files.
        subdirs -- iterate through all sub-directories. Default is False.
    """
    # if not kwargs, default to delete things older than one day
    time_args = {}
    for k,v in kwargs.iteritems():
        if k in deltas:
            time_args[k] = v
    if not time_args:
        time_args['days'] = 1

    # get removal date and operator
    remove_after = datetime.datetime.now() - datetime.timedelta(**time_args)
    op = operator.lt
    if not older_than:
        op = operator.gt

    # optional test
    if test:
        def remove(*args): pass
    else:
        def remove(*args):
            os.remove(args[0])

    # walk thru directory
    for root, dirs, files in os.walk(path):
        if not root.endswith('.gdb'):
            for f in files:
                if not f.lower().endswith('.lock'):
                    if not any(map(lambda ex: fnmatch.fnmatch(f, ex), exclude)):
                        last_mod = datetime.datetime.fromtimestamp(os.path.getmtime(os.path.join(root, f)))

                        # check date
                        if op(last_mod, remove_after):
                            try:
                                remove(os.path.join(root, f))
                                print('deleted: "{0}"'.format(os.path.join(root, f)))
                            except:
                                print('\nCould not delete: "{0}"!\n'.format(os.path.join(root, f)))
                        else:
                            print('skipped: "{0}"'.format(os.path.join(root, f)))
                    else:
                        print('excluded: "{0}"'.format(os.path.join(root, f)))
                else:
                    print('file is locked: "{0}"'.format(os.path.join(root, f)))
        else:
            print('excluded files in: "{0}"'.format(root))

        # break or continue if checking sub-directories
        if not subdirs:
            break

    return

def clean_filename(path):
    """replaces all special characters with underscores

    Required:
        path -- full path to file or folder
    """
    fn = re.sub('[^A-Za-z0-9]+', '_', os.path.basename(path)).replace('__', '_')
    return os.path.join(os.path.dirname(path), fn)

def timestamp():
    """returns a timestamp"""
    return time.strftime('%Y%m%d%H%M%S')

def timeit(function):
    """will time a function's execution time

    Required:
    function -- full namespace for a function

    Optional:
    args -- list of arguments for function
    """
    st = datetime.datetime.now()
    def wrapper(*args, **kwargs):
        output = function(*args, **kwargs)
        Message('"{0}" from {1} Complete - Elapsed time: {2}'.format(function.__name__, sys.modules[function.__module__],
                                                            str(datetime.datetime.now()-st)[:-4]))
        return output
    return wrapper

def Message(*args):
    """
    Prints message to Script tool window or python shell

    msg: message to be printed
    """
    if isinstance(args, (list, tuple)):
        for msg in args:
            print(str(msg))
            arcpy.AddMessage(str(msg))
    else:
        print(str(msg))
        arcpy.AddMessage(str(msg))

def read_config():
    """reads the configuration file"""
    try:
        config_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config.json')
    except:
        config_file = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), 'config.json')
    Message("Config File: {}".format(config_file))
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            return json.load(f)

    return {}

def featureToPointPolyfill(in_fc, output, point_location='INSIDE'):
    """polyfill tool to create centroids without needing ArcGIS Desktop Advanced license

    """

    # create fc
    sm = 'SAME_AS_TEMPLATE'
    path, name = os.path.split(output)
    arcpy.management.CreateFeatureclass(path, name, 'POINT', in_fc, sm, sm, in_fc)

    # loop through geom
    fields = [f.name for f in arcpy.ListFields(in_fc)
              if f.type not in ('OID', 'Geometry')
              and 'shape' not in f.name.lower()]

    # centroid type
    shp_fld = 'SHAPE@XY' if point_location == 'INSIDE' else 'SHAPE@TRUECENTROID'
    fields.insert(0, shp_fld)

    # insert rows
    with arcpy.da.InsertCursor(output, fields) as irows:
        with arcpy.da.SearchCursor(in_fc, fields) as rows:
            for r in rows:
                irows.insertRow(r)

    return output

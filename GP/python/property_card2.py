#-------------------------------------------------------------------------------
# Name:        module1
# Purpose:
#
# Author:      calebma
#
# Created:     17/10/2016
# Copyright:   (c) calebma 2016
# Licence:     <your licence>
#-------------------------------------------------------------------------------
import arcpy
import os
import json
import sys
import textwrap

# network share
sys.path.append(r'\\arcserver1\GIS\_Resources\ESRI\Python\BMI_Library\GeoprocessingServices\demo\python')
import utils

if sys.version_info[0] >= 3:
    basestring = str

arcpy.env.overwriteOutput = True

@utils.timeit
def export_property_card(webmap_json, feature, report_config, pdf_res=100, template_name='portrait'):

    # step 1. parse all json inputs
    if isinstance(webmap_json, dict):
        webmap_json = json.dumps(webmap_json)
    if isinstance(feature, basestring):
        feature = json.loads(feature)
    if isinstance(report_config, basestring):
        report_config = json.loads(report_config)

    # step 2. find template mxd and convert web map to mxd
    config = utils.read_config()
    map_elm_json = report_config.get('element_map', {})
    if not map_elm_json:
        map_elm_json = report_config # no options used, just element map provided
    fields = report_config.get('fields', [])
    use_domains = report_config.get('use_domain_values', True)

    # get mxd template
    templates = config.get('templates', [])
    try:
        template =[t['value'] for t in templates if t['name'].lower() == template_name.lower()][0]
    except:
        template = templates[0].get('value')

    output = arcpy.mapping.ConvertWebMapToMapDocument(webmap_json, template)
    mxd = output.mapDocument

    # step 3. get map elements into a dictionary
    elms = {e.name: e for e in arcpy.mapping.ListLayoutElements(mxd, 'TEXT_ELEMENT') if e.name}

    # step 4. update map elements from feature set with fields from map_elm_json
    # first check if using domains and fields definition provided in report config
    if use_domains and len(fields):
        # update feature to use domain values
        field_map = {f.get('name'): f for f in fields}

        # build field domains lookup
        field_domains = {}
        for fn, fd in field_map.iteritems():
            dom = fd.get('domain')
            if isinstance(dom, 'dict') and dom.get('type') == 'codedValue':
                field_domains[fn] = {c['code']: c['name'] for c in dom.get('codedValues', [])}

        # update feature with domain coded value
        for fld, val in feature.get('attributes', {}).iteritems():
            if fld in field_domains:
                feature['attributes'][fld] = field_domains[fld][val]


    # update map elements with values
    print json.dumps(feature['attributes'], indent=2)
    for elm_name, elm in elms.iteritems():
        if elm_name.startswith('flt_') or elm_name.startswith('cur'):

            num_as_text = map_elm_json.get(elm_name, ' ') or '0'
            try:
                elm_text = '{:0,.2f}'.format(float(num_as_text.format(**feature['attributes'])))
            except ValueError:
                elm_text = '0'

            if elm_name.startswith('cur_') and elm_text != '0':
                elm.text = '$' + elm_text
            else:
                elm.text = elm_text

        else:
            elm_text = map_elm_json.get(elm_name, ' ') or ' '
            elm.text = elm_text.format(**feature['attributes'])

    # step 5.  check if feature has geometry, if so, zoom to an appropriate scale
    geom_json = feature.get('geometry', None)
    centroid = None
    if geom_json:
        poly = arcpy.AsShape(geom_json, True)
        centroid = arcpy.PointGeometry(poly.centroid, poly.spatialReference)
        df = mxd.activeDataFrame

        # might as well update GIS Acres if there is no value
        if elms['flt_gis_acres'].text in (' ', '0'):
            if hasattr(poly, 'getArea'):
                elms['flt_gis_acres'].text = round(poly.getArea(units='ACRES'), 2) #requires 10.2+

        try:
            df.extent = poly.extent
            df.scale *= 1.75
        except RuntimeError: # thrown if df scale is fixed
            pass

    # step 6. Handle Inset map dataframe
    stamp = time.strftime('%Y%m%d%H%M%S')
    if isinstance(centroid, arcpy.PointGeometry):
        tmp_cent = r'in_memory\temp_cent_{}'.format(stamp)
        arcpy.management.CopyFeatures([centroid], tmp_cent)
        lyr = arcpy.mapping.Layer(tmp_cent)
        arcpy.management.ApplySymbologyFromLayer(lyr, config.get('selection_lyr'))
        dfi = arcpy.mapping.ListDataFrames(mxd, 'df_InsetMap')[0]
        arcpy.mapping.AddLayer(dfi, lyr)

    # step  7. Export to PDF
    # clean up temp dir if config tells us to
    temp_dir = config.get('temp_dir', '')
    if config.get('clean_dirs', False) in (True, 'true'):
        utils.remove_files(temp_dir, subdirs=True, minutes=10)
        utils.remove_folders(temp_dir, minutes=10)

    # do export
    arcpy.RefreshActiveView()
    out_pdf = os.path.join(config.get('temp_dir'), 'PropertyCard_{}.pdf'.format(stamp))
    arcpy.mapping.ExportToPDF(mxd, out_pdf, resolution=pdf_res)
    del mxd

    # step 8. Create download link
    url = '/'.join([config.get('web_path'), os.path.basename(out_pdf)])
    utils.Message('Succesfully created download link: "{}"'.format(url))
    return url

if __name__ == '__main__':

    # GP tool
    args = [arcpy.GetParameter(i) for i in range(arcpy.GetArgumentCount()-1)] # last argument is output variable
    url = export_property_card(*args)
    arcpy.SetParameter(arcpy.GetArgumentCount()-1, url)

##    # testing
##    fold = os.path.join(os.path.dirname(__file__), 'tests')
##
##    webmap_js_file = os.path.join(fold, 'webmap_sample.json')
##    with open(webmap_js_file, 'r') as f:
##        webmap_js = json.load(f)
##
##    feature_file = os.path.join(fold, 'feature_sample.json')
##    with open(feature_file, 'r') as f:
##        feature = json.load(f)
##
##    map_elm_js_file = os.path.join(fold, 'report_config.json')
##    with open(map_elm_js_file, 'r') as f:
##        map_elm_js = json.load(f)
##    url = export_property_card(webmap_js, feature, map_elm_js, pdf_res=50)
##    import webbrowser
##    webbrowser.open(url)

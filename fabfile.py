# -*- coding: utf-8

from fabric.api import local
from fabric.decorators import parallel

def webpack_dev():
    '''
    run webpack dev server
    '''
    local('./node_modules/.bin/webpack-dev-server --config webpack/dev.config.js')

def electron_dev():
    '''
    run webpack dev server
    '''
    local('./node_modules/.bin/cross-env NODE_ENV=development ./node_modules/.bin/electron .')

def dev():
    electron_dev()
    webpack_dev()

#!/usr/bin/env node


const program = require('commander');
const mustache = require('mustache');
const lodash = require('lodash');
const upperFirst = lodash.upperFirst;
const lowerFirst = lodash.lowerFirst;
const fs = require('fs');
const path = require('path');

require.extensions['.html'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};


function createIndexFile(dir, name) {
  let indexTpl = require('./templates/index.html');
  fs.writeFile(
    path.resolve(dir, 'index.ts'),
    mustache.render(indexTpl, {name}),
    err => {
      if (err) throw err;
    });
}

function createStyleFile(dir, name) {
  let styleTpl = require('./templates/style.html');
  fs.writeFile(
    path.resolve(dir, 'style.less'),
    mustache.render(styleTpl, {name}),
    err => {
      if (err) throw err;
    });
}

function createComponentFile(dir, tpl, name) {
  fs.writeFile(
    path.resolve(dir, `${name}.tsx`),
    mustache.render(tpl, {name}),
    err => {
      if (err) throw err;
    });
}

function createTestFile(name) {
  let testTpl = require('./templates/test.html');
  fs.writeFile(
    path.resolve(__dirname, `../tests/${name}.tsx`),
    mustache.render(testTpl, {lowerFirstName: lowerFirst(name), upperFirstName: upperFirst(name)}),
    err => {
      if (err) throw err;
    });
}

function appendComponent(name) {
  const filePath = path.resolve(__dirname, '../components/index.ts');
  const originData = fs.readFileSync(filePath);
  const file = fs.openSync(filePath, 'w+');
  const buff = new Buffer(`export { ${name} } from './${name}'\n`);

  const data = buff + originData;

  fs.writeSync(file, data, 0, data.length, 0);
}

function create(name, componentTpl) {
  name = upperFirst(name);
  const fileDir = path.resolve(__dirname, `../components/${name}`);

  if (fs.existsSync(fileDir)) {
    return console.error('component already exist');
  }

  fs.mkdirSync(fileDir);

  appendComponent(name);
  createIndexFile(fileDir, name);
  createStyleFile(fileDir, name);
  createComponentFile(fileDir, componentTpl, name);
  createTestFile(name);
}

program
  .option('-t, --type [value]', 'component type. choices: input', /^(input|dom)/, 'input')
  .option('-n, --name [value]', 'component name. will auto upperFirst')
  .parse(process.argv);


let componentTpl = require('./templates/inputDomComponent.html');

switch (program.type) {
  case 'input':
    componentTpl = require('./templates/inputDomComponent.html');
    break;
  case 'dom':
    componentTpl = require('./templates/domComponent.html');
    break;
}

create(program.name, componentTpl);


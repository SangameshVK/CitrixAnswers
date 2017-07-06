/* eslint no-console: "off" */
const inquirer = require('inquirer');
const { readdirSync, renameSync, readFileSync, writeFileSync } = require('fs');
const { isUpperCase } = require('change-case');
const ncp = require('ncp').ncp;
const path = require('path');

const componentsDir = 'src/components/';
const scaffoldDir = '__SCAFFOLD__';

const validateName = (name) => {
  if (!name) {
    console.log('\nError: Name must be defined\n');
    return false;
  }

  if (!isUpperCase(name.slice(0, 1))) {
    console.log('\nError: Name must be CamelCased\n');
    return false;
  }

  const fileAlreadyExists = readdirSync(componentsDir).some(fileName => fileName === name);

  if (fileAlreadyExists) {
    console.log(`\nError: ${name} already exists: ${componentsDir}${name}\n`);
    return false;
  }

  return true;
};

inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Component Name',
    validate: name => validateName(name.split('/').pop()),
  },
]).then((answers) => {
  const componentName = answers.name;
  const componentDir = path.join(componentsDir, componentName);

  // copy files from __SCAFFOLD__ to the component dir
  ncp(scaffoldDir, componentDir, (err) => {
    if (err) throw new Error(err);

    // read files in the component dir
    readdirSync(componentDir).forEach((fileName) => {
      const newFileName = fileName.replace('__NAME__', componentName);
      const src = path.join(componentDir, fileName);
      const dst = path.join(componentDir, newFileName);

      // rename files accordingly
      renameSync(src, dst);

      // read, replace, write
      const data = readFileSync(path.join(componentDir, newFileName), 'utf8');
      const result = data.replace(/__NAME__/g, componentName);
      writeFileSync(path.join(componentDir, newFileName), result, 'utf8');
    });
  });

  console.log(`All done! \n${componentName} has been created in ${componentDir}`);
});

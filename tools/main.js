var program = require('commander');
var compiler= require('./compiler.js');
var visualizer = require('./visualizer.js');

var adjust = require('./adjust.js');

var fs = require('fs');

String.prototype.endsWith = function( str ) {
  return this.substring( this.length - str.length, this.length ) === str;
};

function merge(a,b){
  for (var key in b) {
    if (b.hasOwnProperty(key)) {
      a[key] = b[key];
    }
  }
}
program
  .version('0.0.1')
  .option('-p, --parser', 'Output parse modules')
  .option('-c, --compiler', 'Output compiled IR')
  .option('-v, --visualizer', 'Output ascii representation of IR')
  .option('-o, --output <file>', 'Output to file')
  .parse(process.argv);


if(program.parser && program.compiler && program.visualizer){
  console.error('Options parser and compiler cannot be active at the same time.');
  process.exit(1);
}
var modules = {};
for(var i = 0; i < program.args.length; i++){
  var mod = {};
  if(program.args[i].endsWith('.mhdl')){
    mod = compiler.parse(fs.readFileSync(program.args[i], "utf8"));
  }else if(program.args[i].endsWith('.json')){
    mod = JSON.parse(fs.readFileSync(program.args[i], "utf8"));
  }else{
    console.error('Unexpected file type');
    process.exit(1);
  }
  merge(modules,mod);
}
if(program.parser){
  fs.writeFileSync(program.output || 'a.json', JSON.stringify(modules), 'utf8');
  process.exit(0);
}
var code = compiler.codegen(modules);
if(program.compiler){
  fs.writeFileSync(program.output || 'a.ir', JSON.stringify(code), 'utf8');
  process.exit(0);
}
if(program.visualizer){
  fs.writeFileSync(program.output || 'a.txt', visualizer.draw(adjust.adjust(code)), 'utf8');
  process.exit(0);
}
console.log('You shouldn\'t see this');
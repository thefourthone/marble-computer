function getToken(){
  var lastChar = input.getChar();
  
  //whitespace
  while(lastChar && !!lastChar.match(/\s/)){
    lastChar = input.getChar();
  }
  
  //comments
  if(lastChar === '/'){
    lastChar = input.getChar();
    if(lastChar === '/'){
      while(lastChar !== '\n' && lastChar !== ''){
        lastChar = input.getChar();
      }
    }else if(lastChar === '*'){
      do{
        lastChar = input.getChar();
        while(lastChar !== '*' && lastChar !== ''){
          lastChar = input.getChar();
        }
      }while(lastChar !== '/' && lastChar !== '');
    }else{
      input.returnChar();
      return {token:'/',index:input.getIndex()};
    }
    input.returnChar();
    return getToken();
  }
  
  // All single character tokens
  if(!lastChar){
    return {token:'EOF'};
  }
  if(lastChar === '('){
    return {token:'(',index:input.getIndex()};
  }
  if(lastChar === ')'){
    return {token:')',index:input.getIndex()};
  }
  if(lastChar === '{'){
    return {token:'{',index:input.getIndex()};
  }
  if(lastChar === '}'){
    return {token:'}',index:input.getIndex()};
  }
  if(lastChar === '['){
    return {token:'[',index:input.getIndex()};
  }
  if(lastChar === ']'){
    return {token:']',index:input.getIndex()};
  }
  if(lastChar === ','){
    return {token:',',index:input.getIndex()};
  }
  if(lastChar === ';'){
    return {token:';',index:input.getIndex()};
  }
  if(lastChar === '='){
    return {token:'=',index:input.getIndex()};
  }
  if(lastChar === '_'){
    return {token:'_',index:input.getIndex()};
  }

  //continue grabbing characters until a special character pops up
  var text = '';
  while(!!lastChar.match(/[^(){}\[\],;=_\/\s]/)){
    text += lastChar;
    lastChar = input.getChar();
  }
  input.returnChar();

  //check keywords
  if(text === 'module'){
    return {token:'module',index:input.getIndex()};
  }
  if(text === 'for'){
    return {token:'for',index:input.getIndex()};
  }
  if(text === 'to'){
    return {token:'to',index:input.getIndex()};
  }
  if(text === 'delay'){
    return {token:'delay',index:input.getIndex()};
  }
  if(text === 'catch'){
    return {token:'catch',index:input.getIndex()};
  }
  return {token: 'other',
          data:   text,
          index:  input.getIndex()};
}

function error(str,tok){
  throw "Parse Error: " + str + '; ' + (JSON.stringify(tok)||'');
}
function parseTopLevel(){
  var tok = getToken();
  var modules = {};
  while(tok.token === 'module'){
    tmp = parseModule();
    modules[tmp.name] = tmp;
    tok = getToken();
  }
  if(tok.token !== 'EOF'){
    error('Unexpected token expected EOF or module',tok);
  }
  return modules;
  
}

function parseModule(){
  var name = getToken();
  if(name.token !== 'other'){
    error('First token in module must be a name',name);
  }
  name = name.data;
  return {name:name,inputs:parseArgs(), outputs:parseArgs(),body:parseBlock()};
}

function parseArgs(){
  var tmp,inputs = [],tok = getToken();
  if(tok.token !==  '('){
    error('Args starts with (',tok);
  }
  tok = getToken();
  while(tok.token !== ')' && tok.token !== 'EOF'){
    if(!tmp){
      if(tok.token !== 'other'){
        error('Inputs must start with identifiers',tok);
      }
      tmp = {name:tok.data};
    }else if(tok.token === '['){
      if(tmp.size || tmp.vector){
        error("unexpected [",tok);
      }
      tmp.vector = true;
    }else if(tok.token === 'other'){
      if(tmp.vector === true){
        tmp.size = tok.data;
      }else{
        error("unexpected identifier",tok);
      }
    }else if(tok.token === ']'){
      if(!tmp.vector || !tmp.size){
        error("unexpected ]",tok);
      }
    }else if(tok.token === ','){
      if(tmp.vector && !tmp.size){
        error("unexpected , expected size");
      }
      inputs.push(tmp);
      tmp = undefined;
    }else{
      error('unexpected token',tok);
    }
    tok = getToken();
  }
  if(tmp){
    inputs.push(tmp);
  }
  if(tok.token === 'EOF'){
    error('Unexpected eof');
  }
  return inputs
}

function parseLH(tok){
  var tmp = {name: ''},lh = [];
  while(tok.token !== '=' && tok.token !== 'EOF'){
    if(tok.token === 'catch' || tok.token === 'delay'){
      tmp.option = tok.token;
      tok = getToken();
      if(tok.token !== '('){
        error('Expect (',tok);
      }
      tok = getToken();
      while(tok.token !== ')' && tok.token !== 'EOF'){
        if(tok.token === '[' || tok.token === ']'){
          tmp.name += tok.token;
        }else if(tok.token === 'other'){
          tmp.name += tok.data;
        }
        tok = getToken();
      }
      
    }else if(tok.token === '[' || tok.token === ']'){
      tmp.name += tok.token;
    }else if(tok.token === 'other'){
      tmp.name += tok.data;
    }else if(tok.token === '_'){
      tmp.name = '_';
    } else if(tok.token === ','){
      lh.push(tmp);
      tmp = {name: ''}
    }else{
      error('unexpected token',tok);
    }
    tok = getToken();
  }
  if(tmp.name){
    lh.push(tmp);
  }
  if(tok.token === 'EOF'){
    error('Unexpected eof');
  }
  return lh
}

function parseBlock(){
  var tok = getToken();
  if(tok.token !== '{'){
    error('Blocks must start with {',tok);
  }
  var statements = [];
  
  var tok = getToken();
  while(tok.token !== '}' && tok.token !== 'EOF'){
    if(tok.token === 'other' || tok.token === '_'){
      var lh = parseLH(tok);
      tok = getToken();
      if(tok.token !== 'other'){
        error('Expected identifier on Right side of =',tok);
      }
      var module = tok.data;
      var inputs = parseArgs();
      tok = getToken();
      if(tok.token !== ';'){
        error('Expected ; at end of statement',tok);
      }
      
      statements.push({type:'statement',module:module,args:inputs,assign:lh});
    }else if(tok.token === 'for'){
      var name = getToken();
      if(name.token !== 'other'){
        error("Expected identifier for index",name);
      }
      name = name.data;
      tok = getToken();
      if(tok.token !== '='){
        error("Expected =",tok);
      }
      var lb = getToken();
      if(lb.token !== 'other'){
        error("Expected identifier",lb);
      }
      tok = getToken();
      if(tok.token !== 'to'){
        error("Expected to",tok);
      }
      var ub = getToken();
      if(ub.token !== 'other'){
        error("Expected identifier",ub);
      }
      statements.push({type:'for',index:name,lowerBound:lb,upperBound:ub,block:parseBlock()});
    }else{
      error("Expected for or identifier at start of statement",tok);
    }
    tok = getToken();
  }
  if(tok.token === 'EOF'){
    error('Unexpected eof');
  }
  return statements;
}

var input = {src:"module adder (in[N],read) (out[N], clk){\n  rst, t = dup(read);       // need 3 ouputs from read, 2 for toggling the output latch twice, and one for clk\n  rst, delay(clk) = dup(t); // delay clk so ouput has time to settle\n  \n  latch = link(); // makes output go to out or null\n  reset = linkt();    // releases stored marbles\n  \n  _, _ = flip(rst,latch,reset);\n  for i=0 to N {\n    in[i+1], catch(tmp[i]) = flip(in[i],reset); // adder circuitry\n    _, out[i] = switch(tmp[i],latch);           // output latch\n  }\n}\nmodule main (in[4],t)(out[4],g){\n  out[4], g = adder(in[4],t);\n}",
             i: 0,
             getIndex: function(){return input.i;},
             getChar: function(){return input.src[input.i++];},
             returnChar: function(){input.i--;}
            };

function codegenStatement(statement,context){
  if(statement.type === 'for'){
    if(context.constants[statement.index]){
      error('index already in use',statement);
    }
    var lb = context.eval(statement.lowerBound.data);
    var ub = context.eval(statement.upperBound.data);
    var out = [];
    console.log(lb,ub)
    for(var i = lb; i < ub; i++){
      console.log(i,statement.block);
      context.constants[statement.index] = i;
      out = out.concat(codegenBlock(statement.block,context));
    }
    delete context.constants[statement.index];
    return out;
  }else if(statement.module === 'link' || statement.module === 'linkt'){
    if(statement.assign.length !== 1){
      error('links require 1 and only 1 ouput',statement);
    }
    if(statement.args.length !== 0){
      error('links require 0 args',statement);
    }
    if(context.links[statement.assign[0]]){
      error('cannot assign link to existing variable',statement);
    }
    context.setLink(statement.assign[0].name, context.newLink());
  }else if(statement.module === 'dup' || statement.module === 'flip' || statement.module === 'switch'){
    
    console.log(statement);
    if(statement.assign.length !== 2){
      error('fundemental modules require 2 and only 2 ouput',statement);
    }
    var links = [];
    for(var i = 1; i < statement.args.length; i++){
      console.log(i,statement.args[i],statement.args);
      var name = statement.args[i].name;
      if(statement.args[i].size){
        name += '['+statement.args[i].size+']';
      }
      links.push(context.getLink(name));
    }
    name = statement.args[0].name
    if(statement.args[0].size){
      name += '['+statement.args[0].size+']';
    }
    var out = [];
    out[0] = {dup:'D',flip:'F','switch':'S'}[statement.module];
    out[1] = context.getPipe(name,true);
    out[2] = context.getPipe(statement.assign[0].name);
    out[3] = context.getPipe(statement.assign[1].name);
    out[4] = links;
    out[5] = {'catch':1,delay:2}[statement.assign[0].option]||0;
    out[6] = {'catch':1,delay:2}[statement.assign[0].option]||0;
    return [out];
  }else{
    if(!context.modules[statement.module]){
      error('Module not found',statement);
    }
    if(context.modules[statement.module].inputs.length !== statement.args.length){
      error('Number of inputs wrong',statement);
    }
    if(context.modules[statement.module].outputs.length !== statement.assign.length){
      error('Number of outputs wrong',statement);
    }
    return codegenModule(context.modules[statement.module],statement.args,statement.assign,context);
  }
}

function codegenBlock(block,context){
  var out = [];
  for(var i = 0; i < block.length; i++){
    out = out.concat(codegenStatement(block[i],context)||[]);
  }
  return out;
}
function codegenModule(module,args,out,context){
  var pipes = {}, constants = {};
  for(var i = 0; i < args.length; i++){
    if(module.inputs[i].size){
      var tmp = constants[module.inputs[i].size] = context.eval(args[i].size);
      for(var k = 0; k < tmp; k++){
        context.remap(args[i].name+'['+k+']',module.inputs[i].name+'['+k+']',pipes);
      }
    }else{
      context.remap(args[i].name,module.inputs[i].name+'[0]',pipes);
    }
  }
  for(var i = 0; i < out.length; i++){
    if(module.outputs[i].size){
      var t = context.lookup(out[i].name).replace(']').split('[');
      var name = t[0];
      var tmp = constants[module.outputs[i].size] = context.eval(t[1]);
      
      for(var k = 0; k < tmp; k++){
        context.remap(name+'['+k+']',module.outputs[i].name+'['+k+']',pipes);
      }
    }else{
      context.remap(out[i].name,module.outputs[i].name+'[0]',pipes);
    }
  }
  var savPipes = context.pipeMap, savConst = context.constants,savLinks = context.linkMap;
  context.save(pipes, constants);
  var code = codegenBlock(module.body,context);
  context.restore();
  return code;
  
}

function codegen(modules,context){
  if(!modules.main){
    error('Must have a main module');
  }
  context.modules = modules;
  var main = modules.main;
  for(var i = 0; i < main.inputs.length; i++){
    if(main.inputs[i].size){
      var tmp = parseInt(main.inputs[i].size);
      for(var k = 0; k < tmp; k++){
        context.getPipe(main.inputs[i].name+'['+k+']');
      }
    }else{
      context.getPipe(main.inputs[i].name+'[0]');
    }
  }
  for(var i = 0; i < main.outputs.length; i++){
    if(main.outputs[i].size){
      var tmp = parseInt(main.outputs[i].size);
      for(var k = 0; k < tmp; k++){
        context.getPipe(main.outputs[i].name+'['+k+']');
      }
    }else{
      context.getPipe(main.outputs[i].name+'[0]');
    }
  }
  return codegenBlock(main.body,context);
}
var context = { pipes: 0, links: 0, pipeMap:{}, pipeRead: [], linkMap:{}, constants: {}, stack:[],
                newLink: function(){
                  return context.links++;
                },
                setLink: function(name,value){
                  context.linkMap[context.lookup(name)] = value;
                },
                getLink: function(name){
                  return context.linkMap[context.lookup(name)];
                },
                getPipe: function(name,read){
                  if(name === '_'){
                    return 0;
                  }
                  var name = context.lookup(name);
                  if(context.pipeMap[name]){
                    if(context.pipeRead[context.pipeMap[name]]){
                      error('Cannot access pipe: '+name +' already read from');
                    }
                    if(read && context.pipeMap[name] !== 0){
                      context.pipeRead[context.pipeMap[name]] = true;
                    }
                    return context.pipeMap[name];
                  }else{
                    if(read){
                      error('Cannot access pipe: '+name +' not created yet');
                    }
                    context.pipeMap[name] = ++context.pipes;
                    return context.pipes
                  }
                },
                lookup: function(name){
                  var parts = name.replace(']','').split('[');
                  if(parts.length > 2){
                    error('Name has multiple [\'s',name)
                  }
                  name = parts[0];
                  var index = 0;
                  if(parts.length === 2){
                    index = context.eval(parts[1]);
                  }
                  
                  return name + '[' + index + ']';
                },
                eval: function(str){
                  var str = str.split(/(\+|-)/);
                  var val = 0;
                  for(var i = 0; i < str.length; i+=2){
                    if(str[i] === ''){ // for a[-N]
                      continue;
                    }
                    if(context.constants[str[i]] !== undefined){
                      val += context.constants[str[i]]*((str[i-1] === '-')?-1:1);
                    }else{
                      val += parseInt(str[i])*((str[i-1] === '-')?-1:1);
                    }
                  }
                  return val;
                },
                remap:function(name,newName,map){
                  map[newName] = context.getPipe(name);
                },
                save:function(pipes,consts){
                  context.stack.push(context.pipeMap);
                  context.stack.push(context.linkMap);
                  context.stack.push(context.constants);
                  
                  context.pipeMap = pipes;
                  context.linkMap = [];
                  context.constants = consts;
                },
                restore:function(){
                  context.constants = context.stack.pop();
                  context.linkMap = context.stack.pop();
                  context.pipeMap = context.stack.pop();
                }
}

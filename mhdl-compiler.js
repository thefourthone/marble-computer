function getToken(){
  var lastChar = input.getChar();
  
  //whitespace
  while(!!lastChar.match(/\s/)){
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
  if(tok.token === 'module'){
    return parseModule();
  }else
    error('Only module definitions are allowed on the top level',tok);
}

function parseModule(){
  var name = getToken();
  if(name.token !== 'other'){
    error('First token in module must be a name',name);
  }
  name = name.data;
  return {name:name,inputs:parseArglist(), outputs:parseArglist(),body:parseBlock()};
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
  if(tmp){
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

var input = {src:"module adder (in[N],read) (out[N], clk){\n  rst, t = dup(read);       // need 3 ouputs from read, 2 for toggling the output latch twice, and one for clk\n  rst, delay(clk) = dup(t); // delay clk so ouput has time to settle\n  \n  latch = link(); // makes output go to out or null\n  _, _ = flip(latch,rst);\n  reset = linkt(latch);    // releases stored marbles\n  \n  for i=0 to N {\n    in[i+1], catch(tmp[N]) = flip(reset,in[i]); // adder circuitry\n    _, out[i] = switch(latch,tmp[i]);           // output latch\n  }\n}",
             i: 0,
             getIndex: function(){return input.i;},
             getChar: function(){return input.src[input.i++];},
             returnChar: function(){input.i--;}
            };

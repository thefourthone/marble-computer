exports.draw = function(ir){
  return draw(ir.inputs,ir.insts);
};
exports.adjust = function(ir){
  var tmp = adjust(ir.inputs,ir.insts);
  ir.inputs = tmp[0];
  ir.insts = tmp[1];
};

function draw(inputs, insts){
  var written = [], out = '';
  for(var i = 0; i < inputs.length; i++){
    written[inputs[i]]=true;
  }
  fill(written);
  out += written.map(function(a){return a?'|':' '}).join('')+'\n';
  for(i = 0; i < insts.length; i++){
    tmp = written.map(function(a){return a?'|':' '});
    tmp[insts[i][1]] = insts[i][0];
    if(insts[i][2] !== 0){
      if(insts[i][2] < insts[i][1]){
        fillTo(insts[i][2]+1,insts[i][1],tmp);
      }else{
        fillTo(insts[i][1]+1,insts[i][2],tmp);
      }
    }
    if(insts[i][3] !== 0){
      if(insts[i][3] < insts[i][1]){
        fillTo(insts[i][3]+1,insts[i][1],tmp);
      }else{
        fillTo(insts[i][1]+1,insts[i][3],tmp);
      }
    }


    out += tmp.join('') + '\n';
    
    written[insts[i][2]] = true;
    written[insts[i][3]] = true;
    written[insts[i][1]] = false;

    written[0] = false;
    fill(written);
    tmp = written.map(function(a){return a?'|':' '});
    if(insts[i][2] !== 0){
      if(insts[i][2] < insts[i][1]){
        tmp[insts[i][2]] = '/';
      }else{
        tmp[insts[i][2]] = '\\';
      }
    }
    if(insts[i][3] !== 0){
      if(insts[i][3] < insts[i][1]){
        tmp[insts[i][3]] = '/';
      }else{
        tmp[insts[i][3]] = '\\';
      }
    }

    out += tmp.join('') + '\n';
  }
  out += written.map(function(a){return a?'|':' '}).join('')+'\n';
  return out;
}
function fill(arr){
  for(var i = 0; i < arr.length; i++){
    arr[i] = !!arr[i];
  }
}

function fillTo(a,b,arr){
  for(var i = a; i < b; i++){
    arr[i] = '_';
  }
}

function adjust(inputs, insts){
  var pull = [], num = [];
  for(var i = 0; i < insts.length; i++){
    pull[insts[i][1]] = pull[insts[i][1]]||0 + (insts[i][2]?insts[i][2]-insts[i][1]:0)+(insts[i][3]?insts[i][3]-insts[i][1]:0);
    num[insts[i][1]] = num[insts[i][1]]||0 + (insts[i][2]?1:0)+(insts[i][3]?1:0);

    pull[insts[i][2]] = pull[insts[i][2]]||0 + insts[i][1] - insts[i][2];
    num[insts[i][2]] = num[insts[i][2]]||0 + 1;

    pull[insts[i][3]] = pull[insts[i][3]]||0 + insts[i][1] - insts[i][3];
    num[insts[i][3]] = num[insts[i][3]]||0 + 1;
  }
  pull = pull.map(function(a,i){return i + a/num[i]/2});
  hist = [];
  for(i = 1; i < pull.length; i++){
    var k = Math.round(pull[i]);
    if(!hist[k]){
      hist[k] = [];
    }
    hist[k].push(i);
  }
  var j = 0, remap = [0];
  var sortby = function(a,b){(pull[a] > pull[b])?1:(pull[a] < pull[b])?-1:0};
  for(i = 1; i < hist.length; i++){
    if(!hist[i]){
      continue;
    }
    hist[i].sort(sortby);
    for(k = 0; k < hist[i].length; k++){
      j++;
      remap[hist[i][k]] = j;
    }
  }
  var out = [], inp = [];
  for(i = 1; i < insts.length; i++){
    out.push([insts[i][0],remap[insts[i][1]],remap[insts[i][2]],remap[insts[i][3]],insts[i][4],insts[i][5],insts[i][6]]);
  }
  for(i = 0; i < inputs.length; i++){
    inp.push(remap[inputs[i]]);
  }
  
  return [inp,out];
}
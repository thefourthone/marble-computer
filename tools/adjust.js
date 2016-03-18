exports.adjust = function(ir){
  return adjust(ir.inputs,ir.outputs,ir.insts);
};

function adjust(inputs, outputs, insts){
  var pull = [], num = [], items = [], pipeEnd = [], pipeStart = [];
  var lookup = function (i){
    if(pipeEnd[i]){
      return items[pipeEnd[i]];
    }
  };
  for(var i = 0; i < inputs.length; i++){
    pipeStart[inputs[i]] = 0;
  }
  for(var i = 0; i < insts.length; i++){
    items[i] = {in:insts[i][1], loc: insts[i][1], a: insts[i][2], b: insts[i][3], pull: 0};
    pipeEnd[items[i].in] = i;
    pipeStart[items[i].a] = (pipeStart[items[i].a] < i)?pipeStart[items[i].a]:i;
    pipeStart[items[i].b] = (pipeStart[items[i].b] < i)?pipeStart[items[i].b]:i;
  }
  for(var i = 0; i < outputs.length; i++){
    pipeEnd[outputs[i]] = items.length;
    items.push({in:outputs[i],a:0,b:0,loc:outputs[i],pull:0});
  }
  for(var p = 0; p < 50; p++){
    for(var i = 0; i < items.length; i++){
      var tmp = lookup(items[i].a); //calculate pulls for outputs
      if(tmp){
        items[i].pull += (tmp.loc - items[i].loc)/4;
        tmp.pull      -= (tmp.loc - items[i].loc)/4;
      }
      tmp = lookup(items[i].b);
      if(tmp){
        items[i].pull += (tmp.loc - items[i].loc)/4;
        tmp.pull      -= (tmp.loc - items[i].loc)/4;
      }
      /*for(var k = 1; k < pipeEnd.length; k++){ //for collision of pipes
        if(i < pipeEnd[k] && i > pipeStart[k]){
          var t = lookup(k);
          if(!t)continue;
          var loc  = t.loc - items[i].loc;
          if(loc*loc < 1.5){
            console.log('conflict',p)
            if(loc > 0){
              t.pull += 0;
              items[i].pull -= 0;
            }else{
              t.pull -= 0;
              items[i].pull += 0;
            }
          }
        }
      }*/
    }
    for(var i = 0; i < items.length; i++){
      items[i].loc += items[i].pull;
      items[i].pull = 0;
    }
  }
  items = items.sort(function(a,b){return (a.loc > b.loc)?1:((a.loc == b.loc)?0:-1)});
  var remap = [0];
  for(var i = 0; i < items.length; i++){
    remap[items[i].in] = i+1;
  }
  var out = [], inp = [], ot = [];
  for(i = 0; i < insts.length; i++){
    out.push([insts[i][0],remap[insts[i][1]]||0,remap[insts[i][2]]||0,remap[insts[i][3]]||0,insts[i][4],insts[i][5],insts[i][6]]);
  }
  for(i = 0; i < inputs.length; i++){
    inp.push(remap[inputs[i]]);
  }
  for(i = 0; i < outputs.length; i++){
    ot.push(remap[outputs[i]]);
  }
  return {inputs:inp,outputs:ot, insts:out, remap:remap};
}
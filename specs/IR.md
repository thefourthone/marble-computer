# Intermediate representation for MHDL
## Format
### General format
It is formatted as JSON with the following top level format:
```js
{
  inputs: [inputs], //list of input pipe indices
  insts:[...],
  //useful for knowing the scale
  pipes: totalPipes,
  links: totalLinks,
  
  //not yet implemented can be filled by counting insts[i][0]
  flips: totalFlips,
  switches: totalSwitches,
  dups: totalDups
}
```

### Instructions
The format is `[itemType, input, output1, output2, [links], OptionsOutput1, OptionsOutput2]` where:
  - `itemType` is `'F'`, `'S'`, or `'D'`
  - `input`, `output1` and `output2` are numerical labels for pipes
  - `[links]` is an array of links that are connected to it
    - `-:linkname` is the format for links, each link can have two modifiers `-` for reversing direction and `:` for reset connections
  - Options are 2 for `delay`, 1 for `catch` and 0 for none
  
## Example

The MHDL code:
```
module adder (in[N],read) (out[N], clk){
  rst, t = dup(read);
  rst, delay(clk) = dup(t);

  latch = link();
  
  _, _ = flip(rst,latch);
  
  for i = 0 to N {
    in[i+1], catch(tmp[i]) = flip(in[i],:latch);
    _, out[i] = switch(tmp[i],latch);
  }
}
```

converts to

```
{
  items:[['D',5,11,12,[],0,0],
         ['D',12,11,10,[],0,2],
         ['F',11,0,0,["0"],0,0],
         ['F',1,2,13,[":0"],0,1],
         ['S',13,0,6,["0"],0,0],
         ['F',2,3,14,[":0"],0,1],
         ['S',14,0,7,["0"],0,0],
         ['F',3,4,15,[":0"],0,1],
         ['S',15,0,8,["0"],0,0],
         ['F',4,0,16,[":0"],0,1],
         ['S',16,0,9,["0"],0,0]],
         
  pipes: 17,
  links:1
  
  flips: 5,
  switches: 4,
  dups: 2
}
```

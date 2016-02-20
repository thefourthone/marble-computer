# Intermediate representation for MHDL
## Format
### General format
It is formatted as JSON with the following top level format:
```js
{
  links:[...],
  items:[...],
  //useful for knowing the scale
  pipes: totalPipes,
  flips: totalFlips,
  switches: totalSwitches,
  dups: totalDups,
  links: totalLinks,
  resets: totalResets
}
```

### Links
Links are either 1, 0, -1, 1 and -1 for resetting (sign indicates direction) and 0 for static.

Example links array if three links are used: a reset to left facing, a reset to right facing, and a static link
```js
  // ...
  links:[-1,1,0],
  // ...
```

### Items
Items are slightly more difficult than links. 
The format is `[itemType, input, output1, output2, [links], OptionsOutput1, OptionsOutput2]` where:
  - `itemType` is `'F'`, `'S'`, or `'D'`
  - `input`, `output1` and `output2` are numerical labels for pipes
  - `[links]` is an array of indices of links that are connected
  - Options are 2 for `delay`, 1 for `catch` and 0 for none 
  
## Example

The MHDL code:
```
module adder (in[N], read) (out[N], clk){
  rst, t = dup(read);
  rst, delay(clk) = dup(t); 
  
  latch = link(); 
  reset = linkt();

  _, _ = flip(latch&reset,rst)
  
  for i = 0 to N {
    in[i+1], catch(tmp[N]) = flip(reset,in[i]); # adder circuitry
    _, out[i] = switch(latch,tmp[i]);           # output latch
  }
}
```

converts to

```
{
  links:[0,1],
  items:[['D',5,11,12,[],0,0],
         ['D',12,11,10,[],0,2],
         ['F',11,0,0,[0,1],0,0],
         ['F',1,2,13,[1],0,1],
         ['S',13,0,6,[0],0,0],
         ['F',2,3,14,[1],0,1],
         ['S',14,0,7,[0],0,0],
         ['F',3,4,15,[1],0,1],
         ['S',15,0,8,[0],0,0],
         ['F',4,0,16,[1],0,1],
         ['S',16,0,9,[0],0,0]],
  pipes: 17,
  flips: 5,
  switches: 4,
  dups: 2,
  links: 1,
  resets: 1
}
```

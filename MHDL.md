# Draft of MHDL Specification
## Fundementals
  - Pipes are transfers for marbles. They can only be inputted into until they are read form and can only be read from once.
  - `a,b = flip(c)` this corresponds to PICTURE HERE
  - `a,b = swith(c)` similarly corresponds to above
  - `a = link()` allocates a static link to be used later
  - `a = linkt()` allocates a reset link to be used later
  - `a,b = dup(c)` duplicates the marble on c into two marbles going on a and b
  - `catch(a),delay(b) = flip(c)` corresponds to PICTURE 
  - `_, a = flip(b)` means marbles on the left are ignored / removed from the system
  - Flips and switches can also be linked using `_, _ = switch(link1&link2,in)`
  
## Modules
  - Modules are defined by `module name (input) (output){ code }`
  - Modules can ony take pipes as inputs and outputs
  - after a module is defined it can be used in another using `output`

## Vectors
  - Vectors are simply a convienient way to write out repetive sections. **THEY ARE EQUIVILENT TO WRITING IT OUT**
  - Vector pipes are defined by `name[Size]` and can be manually accessed with `name[index]`
    - Accessing a vector pipe without defining it first is fine.
  - Vector links can also be made
  - for loops are made using the syntax `for index = start to end { code }` where start and end are numbers, Sizes of vectors, or a combination of two (using addition and subtraction)
  - Duplication for vectors is also possible using `name[N] = dup[N](a)`
  - Vectors can be composed of existing pipes using `{a,b,c,d,e[N]}`
    - Mainly useful for module arguments

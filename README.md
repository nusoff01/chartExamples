# Chart Examples

There are two major principles I use when creating charts:
    > 1. They should be as generic as possible. Similarly shaped data to the first time I create that chart should usable in that chart. In practice, this means decoupling as much of the data, visual display settings like colors, and 
    > 2. Their render function should be as item potent as possible. If I pass the same parameters in as the time before, I should get the same result back out.


I use Typescript and Sass, bundle my code with webpack, and rely on d3 for DOM manipulation and svg rendering.


Included are a heatmap and a very basic linechart. This is for demonstration purposes only - what's given is not sufficient to compile. Shoot me an email (nusoff01@gmail.com) if you're serious about creating a charting library like this and would like help setting up a build system.
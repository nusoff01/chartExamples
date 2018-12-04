import * as d3 from 'd3';

const MARGINS = {
    left: 32,
    right: 32,
    top: 32,
    bottom: 32 
}

class Linechart {
    public renderTarget;
    private options;
    private svgSelection;
    private chartG;
    private xScale;
    private yScale;
    private xVar;
    private yVar;
    private data;
    private chartWidth;
    private chartHeight;
    private draw;
    private xTickValues;
    private xTickLabelFunction;

    private strokeColor = "rgb(0,0,255)";
    private strokeWeight = 2;

    constructor (renderTarget: Element) {
        this.renderTarget = renderTarget;
    }

    public render (data: Array<any>, xVar: string, yVar: string, options: any = {}) {
        d3.select(this.renderTarget).classed("chart-linechart", true);

        this.options = options;
        this.xVar = xVar;
        this.yVar = yVar;
        this.xTickValues = this.options.xTickValues;
        this.xTickLabelFunction = this.options.xTickLabelFunction;
        this.chartWidth = d3.select(this.renderTarget).node().getBoundingClientRect().width - MARGINS.left - MARGINS.right;
        this.chartHeight = d3.select(this.renderTarget).node().getBoundingClientRect().height - MARGINS.top - MARGINS.bottom;

        d3.select(this.renderTarget)
            .style("width", this.chartWidth + MARGINS.left + MARGINS.right + "px")
            .style("height", this.chartHeight + MARGINS.top + MARGINS.bottom + "px");            

        this.data = data;

        let xDomain = this.options.xDomain ? this.options.xDomain : d3.extent(this.data.map(d => Number(d[xVar])));
        let yDomain = this.options.yDomain ? this.options.yDomain : d3.extent(this.data.map(d => Number(d[yVar])));
        
        this.xScale = d3.scaleLinear()
            .range([0, this.chartWidth])
            .domain(xDomain);
        
        this.yScale = d3.scaleLinear()
            .range([this.chartHeight, 0])
            .domain(yDomain);


        if (this.svgSelection == null) {
            this.svgSelection = d3.select(this.renderTarget).append("svg")
                .attr("width", this.chartWidth + MARGINS.left + MARGINS.right)
                .attr("height", this.chartHeight + MARGINS.top + MARGINS.bottom)
                .attr("class", "chart-linechartSVG");

            this.chartG = this.svgSelection.append("g")
                .attr("transform", "translate(" + MARGINS.left + "," + MARGINS.top + ")");

            this.draw = () => {
                let line = d3.line()
                    .x(d =>  {
                        let value = d[this.xVar];
                        return this.xScale(d[this.xVar]);
                    }) 
                    .y(d => this.yScale(d[this.yVar]))
                    .curve(d3.curveMonotoneX);
                
                this.chartG.append("path")
                    .datum(this.data)
                    .attr("class", "chart-linePath")
                    .attr("d", line)
                    .attr("stroke", this.strokeColor)
                    .attr("stroke-width", this.strokeWeight)
                    .attr("fill", "none");

                let xAxis = this.svgSelection.selectAll(".xAxis")
                    .data([this.xScale]);
                xAxis.enter()
                    .append("g")
                    .attr("class", "xAxis chart-axis")
                    .merge(xAxis)
                    .call(d3.axisBottom(this.xScale).tickValues(this.xTickValues).tickFormat(this.xTickLabelFunction))
                    .attr("transform", "translate(" + MARGINS.left + "," + (this.chartHeight + MARGINS.top) + ")");

                let yAxis = this.svgSelection.selectAll(".yAxis")
                    .data([this.yScale]);
                yAxis.enter()
                    .append("g")
                    .attr("class", "yAxis chart-axis")
                    .merge(yAxis)
                    .call(d3.axisLeft(this.yScale))
                    .attr("transform", "translate(" + MARGINS.left + "," + MARGINS.top + ")");    

                xAxis.exit().remove();
                yAxis.exit().remove();
            } 
        }
        this.draw();
    }
}

export {Linechart}
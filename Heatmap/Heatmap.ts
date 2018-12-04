import * as d3 from 'd3';
import './Heatmap.scss';

const MARGINS = {
    left: 40,
    right: 40,
    top: 20,
    bottom: 4 
}


class Heatmap {
    public renderTarget;
    
    private options;
    private svgSelection;
    private chartG;
    private xScale;
    private yScale;
    private xVar;
    private xIntervalSize;
    private yIntervalSize;
    private yVar;
    private valueVar;
    private valueRange;
    private data;
    private filteredData;
    private chartWidth;
    private chartHeight;
    private colorFunction;
    private strokeFunction;
    private draw;
    private legendPanel;
    private xTickValues;
    private xTickLabelFunction;
    private yTickValues;
    private yTickLabelFunction;
    private colorScaleContainer;
    private colorMap;
    private blockWidth = 36;
    private cellWidth;
    private cellHeight;

    constructor (renderTarget: Element) {
        this.renderTarget = renderTarget;
    }

    public render (data: Array<any>, xVar: string, yVar: string, valueVar: string, xIntervalSize: number, yIntervalSize: number, options: any = {}) {
        d3.select(this.renderTarget).classed("chart-heatmap", true);

        this.options = options;
        this.colorMap = this.options.colorMap;
        this.xVar = xVar;
        this.xIntervalSize = xIntervalSize;
        this.yVar = yVar;
        this.yIntervalSize = yIntervalSize;
        this.valueVar = valueVar;
        this.xTickValues = this.options.xTickValues ? this.options.xTickValues : null;
        this.xTickLabelFunction = this.options.xTickLabelFunction ? this.options.xTickLabelFunction : null;
        this.yTickValues = this.options.yTickValues ? this.options.yTickValues : null;
        this.yTickLabelFunction = this.options.yTickLabelFunction ? this.options.yTickLabelFunction : null;
        this.strokeFunction = this.options.strokeFunction ? this.options.strokeFunction : () => 'none';
        this.chartWidth = d3.select(this.renderTarget).node().getBoundingClientRect().width - MARGINS.left - MARGINS.right;
        this.chartHeight = d3.select(this.renderTarget).node().getBoundingClientRect().height - MARGINS.top - MARGINS.bottom - 60;

        d3.select(this.renderTarget)
            .style("width", this.chartWidth + MARGINS.left + MARGINS.right + "px")
            .style("height", this.chartHeight + MARGINS.top + MARGINS.bottom + "px");            

        this.data = data;
        this.filteredData = this.options.filterDataFunction ? this.options.filterDataFunction(this.data) : this.data;
        this.valueRange = d3.extent(this.filteredData.map(d => Number(d[this.valueVar])));
        this.colorFunction = this.options.color ? this.options.color : (d) => {
            if (d[this.valueVar] !== undefined && d[this.valueVar] !== null) {
                return "rgba(255,0,0," + (.75 * (d[this.valueVar] - this.valueRange[0]) / (this.valueRange[1] - this.valueRange[0])) + ")";
            }
            return "none";
        };

        let pureXDomain = d3.extent(this.filteredData.map(d => Number(d[xVar])));
        let pureYDomain = d3.extent(this.filteredData.map(d => Number(d[yVar])));

        this.xScale = d3.scaleLinear()
            .range([0, this.chartWidth])
            .domain(this.options.xDomain ? this.options.xDomain : pureXDomain);
        
        this.yScale = d3.scaleLinear()
            .range([this.chartHeight, 0])
            .domain(this.options.yDomain ? options.yDomain : pureYDomain);


        if (this.svgSelection == null) {
            this.svgSelection = d3.select(this.renderTarget).append("svg")
                .attr("width", this.chartWidth + MARGINS.left + MARGINS.right)
                .attr("height", this.chartHeight + MARGINS.top + MARGINS.bottom)
                .attr("class", "chart-heatmap");

            this.chartG = this.svgSelection.append("g")
                .attr("transform", "translate(" + MARGINS.left + "," + MARGINS.top + ")");

            this.legendPanel = d3.select(this.renderTarget).append("div")
                .attr("class", "chart-legendPanel");

            this.colorScaleContainer = d3.select(this.renderTarget).append("div")
                .attr("class", "chart-heatmapColorScaleContainer");
            this.colorScaleContainer.append("svg");

            this.draw = () => {
                if (this.options.xGuideLines && this.options.xGuideLines.length > 0) {
                    let xGuideLines = this.chartG.selectAll(".xGuideLine")
                        .data(this.options.xGuideLines);
                    xGuideLines.enter()
                        .append("line")
                        .attr("class", "xGuideLine guideLine")
                        .merge(xGuideLines)
                        .attr("x1", 0)
                        .attr("x2", this.chartWidth)
                        .attr("y1", d => this.yScale(d))
                        .attr("y2", d => this.yScale(d))
                        .attr("stroke-width", 1);
                    xGuideLines.exit().remove();
                }

                if (this.options.yGuideLines && this.options.yGuideLines.length > 0) {
                    let yGuideLines = this.chartG.selectAll(".yGuideLine")
                        .data(this.options.yGuideLines);
                    yGuideLines.enter()
                        .append("line")
                        .attr("class", "yGuideLine guideLine")
                        .merge(yGuideLines)
                        .attr("x1", d => this.xScale(d))
                        .attr("x2", d => this.xScale(d))
                        .attr("y1", this.chartHeight)
                        .attr("y2", 0)
                        .attr("stroke-width", 1);
                    yGuideLines.exit().remove();
                }

                let cells = this.chartG.selectAll(".chart-cell")
                    .data(this.filteredData);

                this.cellWidth = Math.floor(this.xScale(this.xIntervalSize));
                this.cellHeight = Math.floor(this.yScale(this.yIntervalSize));


                var pointsEntered = cells.enter()
                    .append("rect")
                    .classed("chart-cell", true)
                    .merge(cells)
                    .on("click", d => console.log(d.count))
                    .attr("x", d => this.xScale(d[xVar]))
                    .attr("y", d => this.yScale(d[yVar]))
                    .attr("width", d => this.cellWidth)
                    .attr("height", d => this.cellHeight)
                    .attr("fill", this.colorFunction)
                    .attr("stroke", (d) => {
                        return this.strokeFunction(d);
                    })
                    .attr("stroke-width", 2)

                let xAxis = this.svgSelection.selectAll(".chart-heatmapXAxis")
                    .data([this.xScale]);
                xAxis.enter()
                    .append("g")
                    .attr("class", "xAxis chart-axis chart-heatmapXAxis")
                    .merge(xAxis)
                    .call(d3.axisTop(this.xScale)
                                .tickValues(this.xTickValues)
                                .tickFormat(this.xTickLabelFunction))
                    .attr("transform", "translate(" + MARGINS.left + "," + (MARGINS.top) + ")").selectAll(".tick")
                    .selectAll("text")
                    .attr("text-anchor", "start")
                    .attr("dx", "2px");

                let xAxisLabel = this.chartG.selectAll(".chart-xAxisLabel")
                    .data([this.options.xAxisLabel ? this.options.xAxisLabel : ""]);
                let xAxisEntered = xAxisLabel.enter().append("g")
                    .attr("class", "chart-xAxisLabel chart-axisLabel")
                    .merge(xAxisLabel)
                    .attr("transform", "translate(" + (this.chartWidth / 2) + "," + (this.chartHeight + 40) + ")");
                xAxisEntered
                    .selectAll("*")
                    .remove();
                let xAxisLabelBox = xAxisEntered.append("rect")
                    .style("background-color", "black");
                let xAxisLabelText = xAxisEntered
                    .append("text")
                    .text(d => {
                        return d;
                    })
                    .attr("x", "0px")
                    .attr("y", "0px");
                
                let textBCC = xAxisLabelText.node().getBoundingClientRect();
                xAxisLabelBox.attr("x1", -Math.round(textBCC / 2))
                    .attr("x2", Math.round(textBCC / 2))
                    .attr("y1", 0)
                
                xAxisLabel.exit().remove();

                let yAxisLabel = this.chartG.selectAll(".chart-yAxisLabel")
                    .data([this.options.yAxisLabel ? this.options.yAxisLabel : ""]);
                yAxisLabel.enter().append("text")
                    .text(d => {
                        return d;
                    })
                    .attr("class", "chart-yAxisLabel chart-axisLabel")
                    .merge(yAxisLabel)
                    .style("transform", 'rotate(-90deg) translateY(-40px) translateX(-' + (this.chartHeight / 2) + "px)")
                xAxisLabel.exit().remove();

                let yAxis = this.svgSelection.selectAll(".yAxis")
                    .data([this.yScale]);
                yAxis.enter()
                    .append("g")
                    .attr("class", "yAxis chart-axis chart-heatmapYAxis")
                    .merge(yAxis)
                    .call(d3.axisLeft(this.yScale).tickValues(this.yTickValues).tickFormat(this.yTickLabelFunction))
                    .attr("transform", "translate(" + MARGINS.left + "," + MARGINS.top + ")") 
                    .selectAll(".tick")
                    .selectAll("text")
                    .attr("alignment-baseline", "middle")
                    .attr("dy", this.cellHeight / 2);   

                
                xAxis.exit().remove();
                yAxis.exit().remove();
                cells.exit().remove();
            } 

        }
        this.draw();
        this.drawScale();
    }

    private drawScale () {
        let colorArray = Object.keys(this.colorMap).map((upperBoundValue) => {
            return [upperBoundValue, this.colorMap[upperBoundValue]];
        });
        let colorScaleSVG =  this.colorScaleContainer.select("svg")
            .attr("width", colorArray.length * this.blockWidth + 130)
            .attr("height", 48);
        let g = colorScaleSVG.append("g")
            .attr("transform", "translate(2,2)");
        let colorBlocks = g.selectAll(".chart-colorScaleBlock")
            .data(colorArray, (d) => d[0]);
        colorBlocks.enter()
            .append("rect")
            .attr("class", "chart-colorScaleBlock")
            .attr("x", (d, i) => i* this.blockWidth)
            .attr("y", 0)
            .attr("width", this.blockWidth)
            .attr("height", 24)
            .merge(colorBlocks)
            .style("fill", d => d[1]);

        colorBlocks.exit().remove()

        let colorLabels = g.selectAll(".chart-colorScaleLabel")
            .data(colorArray, (d) => d[0]);
        colorLabels.enter()
            .append("text")
            .attr("class", "chart-colorScaleLabel")
            .attr("x", (d, i) => {
                return (i + .5)* this.blockWidth;
            })
            .attr("y", 28)
            .attr("alignment-baseline", "hanging")
            .attr("text-anchor", "middle")
            .merge(colorBlocks)
            .text((d, i) => {
                if (d[0] == 0) {
                    return "0"
                }
                return String(d[0] - 4) + " - " + String(d[0])
            });
        colorLabels.exit().remove();

        g.append("rect")
            .attr("x", colorArray.length * this.blockWidth + 36)
            .attr("y", 0)
            .attr("width", this.cellWidth)
            .attr("height", 24)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        g.append("text")
            .attr("x", colorArray.length * this.blockWidth + 20 + this.cellWidth + 24)
            .attr("y", this.cellHeight / 2)
            .attr("class", "chart-colorScaleLabel chart-colorScaleSpecialModifier")
            .attr("alignment-baseline", "middle")
            .text("= Eating")
    }
}

export {Heatmap}
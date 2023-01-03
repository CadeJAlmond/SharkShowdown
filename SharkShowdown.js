/**
 * Class : SharkShowdown.js
 *   - This program is designed to emulate a biological
 *   environment. This environment is comprised of only two
 *   animals, that being sharks and minnows. When the
 *   program is ran, the User may enter the population
 *   size of the sharks and minnows and years in simulation.
 *   Afterwards, a graph representing the populations are
 *   displayed and statistics are provided.
 *  
 * Author: Cade Almond
 * Date  : 12/16/22
 */
 
// #-------------- Simulation Variables  --------------#
 
// Population Related Variables
const sharkPreyConversion = 0.6;
const minnowGrowthRate  = 0.2;
const sharkMoralityRate = 0.2;
const carryCapacity = 1000.0;
const predationRate = 0.0022
 
// Recording Population
let sharkPopulation  = 0;
let minnowPopulation = 0;
let sharkDataSet  = [];
let minnowDataSet = [];
let labels = [];
 
// Tracking Statistics
let bornMinnows = 0;
let bornSharks  = 0;
 
// UI elements for simulation
const runSimulation = document.getElementById('simulation_btn');
var chart = document.getElementById('myChart').getContext('2d');
let chartDisplay;
let delayed;
 
// UI Properties for graph
graphOptions = {
    animation: {
        onComplete: () => {
            delayed = true;
        },
        delay: (context) => {
            let delay = 0;
            if (context.type === "data" && context.mode === "default" && !delayed)
                delay = context.dataIndex * 50 + context.datasetIndex * 500;
            return delay;
        }
    },
    scales: {
        y: {
          title: { display: true, text: "Population Size", color: "#eaeaea", font: {size: 28,
                   family: "Source Sans Pro",}, padding: {top: -5, bottom: 15}},
          grid: { display: true, color: "rgba(255,99,132,0.2)",},
        },
        x: {
            title: { display: true, text: "Years", color: "#eaeaea", font: {size: 28,
            family: "Source Sans Pro",}, padding: {top: 35}},
        },
    }
}

// ##----------------- Class Methods ----------------##
 
/**
 * This method will initiate a new simulation, which the results will
 * be displayed to the UI.
 */
runSimulation.addEventListener('click', e => {
    e.preventDefault();
    beginSimulation(+(document.getElementById('sim_iterations').value),
        +(document.getElementById('shark_pop') .value),
        +(document.getElementById('minnow_pop').value));
    sharkDataSet  = [];
    minnowDataSet = [];
    labels = [];
    bornMinnows = 0;
    bornSharks  = 0;
});
 
/**
 * This method will check for illegal parameters which could
 * introduce errors into the simulation.
 */
function illegalParameters(iterations, sharks, minnows) {
    if(iterations < 5 || iterations > 1000)
        return true;
    else if(sharks < 1 || sharks > 2000)
        return true;
    return minnows < 1 || minnows > 2000;
}
 
/**
 * This method will construct an error message to display to the
 * user.
 */
function showErrorMsg(iterations, sharks, minnows) {
    let errorMsg = "Error:";
    errorMsg += (iterations < 5 ? " provided years must be above 5," :
                (iterations > 2000 ? " provided years must not be above 2000," : ""));  
    errorMsg += (sharks < 1 ? " provided sharks must be above 0," :
                (sharks > 2000 ? " provided sharks must not be above 2000,"  : ""));
    errorMsg += (minnows < 1 ? " provided minnows must be above 0," :
                (minnows > 2000 ? "provided minnows must not be above 2000," : ""));
    document.querySelector('.error_label').innerHTML = errorMsg;
}
 
/**
 * This method is responsible for updating, visualizing and recording
 * the population count over the given iterations of the simulation.
 */
function beginSimulation(iterations, sharks, minnows) {
    // Prepare simulation
    sharkPopulation  = sharks;
    minnowPopulation = minnows;
    let wentExtinct  = false;
    document.querySelector('.error_label').innerHTML = " ";
    if(illegalParameters(iterations, sharks, minnows)){
        showErrorMsg(iterations, sharks, minnows);
        return;
    }
 
    // Start simulation
    recordPopulations(-1);
    for (let i = 0; i < iterations; i++) {
        updatePopulations(i);
        recordPopulations(i);
        // End loop if a population went extinct
        if (parseInt(minnowPopulation) <= 0 || parseInt(sharkPopulation ) <= 0) {
            iterations = i  + 1;
            wentExtinct = true;
            break;
        }
    }
    renderPageGraph(sharkDataSet, minnowDataSet, labels, graphOptions);
    renderPageStats(iterations, wentExtinct);
}
 
/**
 * This method will calculate the change in, and update, the population
 * size of the minnows and sharks.
 */
function updatePopulations(i) {
    let changeInMinnows = minnowGrowthRate * minnowPopulation * (1 - minnowPopulation /
        carryCapacity) - (predationRate * minnowPopulation * sharkPopulation);
    let changeInSharks  = (sharkPreyConversion * predationRate * minnowPopulation *
        sharkPopulation) - (sharkPopulation * sharkMoralityRate);

    if(Math.abs(changeInMinnows) > (minnowPopulation))
        changeInMinnows = -minnowPopulation;
    if(Math.abs(changeInSharks) > sharkPopulation)
        changeInSharks = -sharkPopulation;
 
    minnowPopulation += changeInMinnows;
    sharkPopulation  += changeInSharks ;
 
    if (changeInMinnows > 0)
        bornMinnows += changeInMinnows;
    if (changeInSharks > 0)
        bornSharks += changeInSharks;
}
 
/**
 * This method will record the newly updated population data
 */
function recordPopulations(iterations) {
    minnowDataSet.push(minnowPopulation);
    sharkDataSet .push(sharkPopulation);
    labels.push(iterations + 1);
}
 
/**
 * This method will construct the Chart from the provided population
 *  data generated in sharkDataSet and minnowDataSet .
 */
function renderPageGraph(sharkData, minnowData, labelData, options) {

    // Create Styling for graph lines
    var gradient = chart.createLinearGradient(0, 0, 0, 450);
    gradient.addColorStop(0.0, 'rgba(255, 0,0, 0.45)');
    gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.275)');
    gradient.addColorStop(1.0, 'rgba(255, 0, 0, 0.1)');
 
    var gradient2 = chart.createLinearGradient(0, 0, 0, 450);
    gradient2.addColorStop(0.0, 'rgba(34, 211, 235, 0.45)');
    gradient2.addColorStop(0.5, 'rgba(34, 211, 235, 0.275)');
    gradient2.addColorStop(1.0, 'rgba(34, 211, 235, 0.1)');
 
    // Define the characteristics of the Graph
    const data = {
        type: 'line',
        data: {
            labels: labelData,
            // Define the data being places
            datasets: [{
                label: 'Sharks',
                data: sharkData,
                fill: true,
                borderWidth: 1,
                pointBackgroundColor: '#911215',
                borderColor: '#911215',
                backgroundColor: gradient,
            }, {
                label: 'Minnows',
                data: minnowData,
                fill: true,
                borderWidth: 1,
                pointBackgroundColor: 'rgba(34, 211, 235, 0.45)',
                borderColor: 'rgba(34, 211, 235, 0.45)',
                backgroundColor: gradient2,
            }
            ],
        },
        options: options,
    };
 
    if(chartDisplay)
        chartDisplay.destroy();
    // Construct the chart
    chartDisplay = new Chart(chart, data);
}
 
/**
 * Updates the page with statistics involved in the current iteration
 * of the simulation
 */
function renderPageStats(iterations, wentExtinct) {
    let yearInfo     = `During the ${iterations} years of the simulation <br>`;
    let totalSharks  = sharkDataSet .reduce((sharkCount,  currentCount) => sharkCount  += currentCount);
    let totalMinnows = minnowDataSet.reduce((minnowCount, currentCount) => minnowCount += currentCount);
 
    //Update statistics contents in UI
    let averageSharkPopulation   = parseInt(totalSharks  / iterations);
    let averageMinnowsPopulation = parseInt(totalMinnows / iterations);
    document.getElementById("content1").querySelector('.text').innerHTML = `${yearInfo} The average shark population size was :
         ${averageSharkPopulation} <br>The average minnow population size was : ${averageMinnowsPopulation}`;
 
    document.getElementById("content2").querySelector('.text').innerHTML = `${yearInfo} The shark birth count was : 
         ${parseInt(bornSharks)} <br>The minnow birth count was ${parseInt(bornMinnows)}`;

    let maxMinnow = Math.max(...minnowDataSet);
    let maxShark  = Math.max(...sharkDataSet );
    document.getElementById("content3").querySelector('.text').innerHTML = `${yearInfo} The maximum shark population size was :
         ${parseInt(maxShark)} <br>The maximun minnow population size was : ${parseInt(maxMinnow)}`;
 
    if (!wentExtinct)
        document.getElementById("content4").querySelector('.text').innerHTML = yearInfo + "No species went extinct ";
    else {
        let species = (parseInt(sharkPopulation) === 0) ? "sharks" : "minnows";
        document.getElementById("content4").querySelector('.text').innerHTML = `${yearInfo} The ${species} 
            population went extinct`;
    }
}
 
// #-------------- UI Tab Logic --------------#
 
// UI elements
const iconBoxs    = document.querySelectorAll('.display_label')
const contentBoxs = document.querySelectorAll('.content_display')
 
// On-Hover
iconBoxs.forEach(icon => icon.addEventListener('mouseover', function () {
    // Reset the class names of all contentBoxes
    contentBoxs.forEach(content => content.className = 'content_display');
    // Display the corresponding selected content data
    document.getElementById(this.dataset.id).className = 'content_display active';
    // Clear the display of the tab labels
    iconBoxs.forEach(icon => icon.className = 'display_label');
    // Highlight the currently selected display label
    this.className = 'display_label active';
}))

// Load graph on-webiste load
window.addEventListener('load', () => {
    renderPageGraph([], [], [], {scales: graphOptions.scales});
});

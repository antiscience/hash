const Dijkstra = async (Matrix, start) => {

    // Init
    let Qeue = [...Matrix[0].keys()];
    let Distances = new Array(Matrix.length).fill(-1);
    let Hops = new Array(Matrix.length).fill(null); 

    Distances[start] = 0;
    Hops[start] = -1;

    let iterations = 0;

    // Main
    while (Qeue.length) {

        // Get a vertice with the min distance to start from Queue
        let index = 0;
        let current = Qeue[index]; 
        let min = Distances[current]; 
        iterations++;
        
        for (let i = 0; i < Qeue.length; i++) {
            let v = Qeue[i];
            let dist = Distances[v];
            if (dist > -1 && (dist < min || min === -1)) {
                min = dist;
                current = v;
                index = i;
            }
        }

        if (min === -1) break; // exit early: no more connected vertices

        await callback_current(current, iterations);
        Qeue.splice(index, 1);

        // For all neighbors of current in Qeue
        for (let i = 0; i < Qeue.length; i++) {

            let v = Qeue[i];
            let weight = Matrix[current][v];
            if (weight === 0) continue;

            await callback_neighbor_start(current, v); 

            let alt = weight + Distances[current];
            let old = Distances[v]; 
            if (alt < old || -1 === old) {
                Distances[v] = alt;
                let old_hop = Hops[v];
                Hops[v] = current;

                await callback_hop(current, old_hop, v); 
            }

            await callback_neighbor_end(current, v); 
        }
    }
    return {"Distances": Distances, "Hops": Hops}
}
    
const Gpath = (u, Hops) => {

    let path = [u];
    let hop = Hops[u];
    while (hop !== -1 && hop !== null) {
        path.push(hop);
        hop = Hops[hop];
    }
    return path;
}


const getRandomMatrix = N => {

    const M = [];
    const randEdge = () => Math.random() < 3.5/N ? true : false; // we want ? edges per node in average - binomial 
    const randDist = () => Math.floor(Math.random()*(N -1)) + 1;

    for (let i = 0; i < N; i++) {
        M[i] = [];
        for (let j = i + 1; j < N; j++) M[i][j] = randEdge() ? randDist() : 0;
        for (let j = 0; j < i; j++ ) M[i][j] = M[j][i];
        M[i][i] = 0;
    }
    
    for (let i = 0; i < N; i++) {
        const count = M[i].filter(m => m > 0).length;
        if (count == 0) {
            const r = Math.floor(Math.random()*(N-1)+1);
            const m = (i + r)%N;
            M[i][m] = randDist();
            M[m][i] = M[i][m];
        }
    }
    return M;
}

const getGraphData = M => {

    const N = M.length;
    const Gdata = { nodes: [], edges: [] }
    Gdata.nodes = [...(new Array(N)).keys()].map(n => ({ data: { id: n }}));
    
    let w;
    for (let i = 0; i < N; i++ ) {
        for (let j = i + 1; j < N; j++) {
            w = M[i][j];
            if (w) Gdata.edges.push({ data: { id: i+'-'+j, source: i, target: j, weight: w } });
        }
    }
    return Gdata;
}


const drawGraph = data => { 

    cy = cytoscape(
    {   container: document.getElementById('graph'),

        elements: data,

        layout: {
            name: 'random',
            padding: 30, 
            animate: true, 
            animationDuration: 500,
            animationEasing: 'ease-in' 
        },
        style: [
        {
            selector: 'node',
            style: {
            'height': '16px',
            'width': '16px',
            //  'label': 'data(id)',
            'text-background-opacity': 1,
            'text-background-padding': '3px',

            'background-color': 'white',
            'border-color': 'black',
            'border-width': '3px',
            //'content': 'data(id)',
            'min-zoomed-font-size': 16,
            'color': '#fff',
            'font-size': '16',
            'z-index': 100,
            'cursor': 'pointer'
            }
        },
        { 
            selector: 'edge',
            style: {
            //'label': 'data(weight)',

            'min-zoomed-font-size': 36,
            'font-size': 8,
            'color': '#fff',
            'line-color': 'white',
            'width': 1,
            'curve-style': 'haystack',
            'haystack-radius': 0,
            'opacity': 0.7
            }
        },
        {
            selector: 'node.current',
            css: {
                    'background-color': '#FF6600',
                    'width': '15px',
                    'height': '15px',
                    'opacity': 1
            }
        },
        {
            selector: 'edge.neighbor',
            css: {
                    'line-color': 'red',
                    'width': 3,
                    'opacity': 0.8,
                    'z-index': 2
            }
        },
        {
            selector: 'edge.added',
            css: {
                    'line-color': '#00C300',
                    'width': 3,
                    'opacity': 0.8,
                    'z-index': 3
            }
        },
        {
            selector: 'edge.path',
            css: {
                    'line-color': '#0099FF',
                    'width': 4,
                    'opacity': 1,
                    'z-index': 5
            }
        },
        {
            selector: 'node.root',
            css: {
                    'background-color': '#0061FF',
                    'width': '25px',
                    'height': '25px',
                    'text-background-color': '#000',
                    'text-background-padding': '6px',
                    'text-background-opacity': 0,
                    'color': 'white',
                    'text-halign': 'center',
                    'text-valign': 'top',
                    'opacity': 0.8
            }
        },
        {
            selector: 'node.start',
            css: {
                'height': 25,
                'width': 25,
                'min-zoomed-font-size': 0,
                'font-size': 20,
                'border-color': '#000',
                'border-width': '5px',
                'text-outline-color': '#000',
                'text-outline-width': '10px',
                'z-index': 9999,
                'background-color': '#FC4C4C',
                'color': 'red',
                'opacity': 1
            }
        },
        {
            selector: 'node.path',
            css: {
                'height': 20,
                'width': 20,
                'border-color': '#000',
                'border-width': '5px',
                'z-index': 9999,
                'background-color': '#FC4C4C',
                'color': 'red',
                'opacity': 1
            }
        },
        {
            selector: 'edge.not-path',
            css: 
            {
                'opacity': 0.4,
                'z-index': 0,
            }
        },
        {
            selector: 'node.not-path',
            css: {
                'opacity': 0.7,
              }
        }
        ]
    });

    cy.getElementById(G.root)
    .style('label', 'ROOT')
    .addClass('root')
    .animate({
        position: { x: 40, y: 40 },
    }, {
    duration: 500
    });

    cy.nodes().on('click', e => {
        if (G.ready) drawPath(e.target.id())
        else showToast('Info', 'Algorithm must be run and finish first - Press "Start" and wait', 1)
    })

    return cy;
}

const id = (one, two) => [one, two].sort((x, y) => x -y).join('-');

const callback_current = async (current, iterations) => {
    const c = G.cy.getElementById(current);
    c.addClass('current');
    mon_current.textContent = ' '+current;
    mon_total.textContent = ' '+iterations;

    await sleep();
}

const callback_neighbor_start = async (c, n) => { 

    let e = id(c, n); 
    G.cy.getElementById(e).addClass('neighbor');
    mon_neighbor.textContent = ' '+n;
    await sleep();
}

const callback_neighbor_end = async (c, n) => { 

    let e = id(c, n); 
    G.cy.getElementById(e).removeClass('neighbor'); 
    await sleep(); 
}

const callback_hop = async (c, o, n) => { 

    let e = id(c, n);
    G.cy.getElementById(e).addClass('added');

    e = id(n, o); 
    G.cy.getElementById(e).removeClass('added'); 

    mon_hop.textContent = ' '+(o ? n+'-/->'+o : '1st hop')+' >> '+n+' --> ' + c;

    await sleep();
}

const sleep = (speed) => {

    speed = speed || G.speed;
    return new Promise(resolve => setTimeout(resolve, speed));
}


const G = { root: 0, cy: null, Matrix: null, Gdata: null, speed: 300 }
//fetch('css/tokyo.cycss').then(res => { G.style = res.text() });

const view = document.getElementById("graph");
const size_input = document.getElementById("graph_size");
const draw = document.getElementById("draw");
const start = document.getElementById("start");
const speed = document.getElementById("speed");
const mon_current = document.getElementById("mon-current");
const mon_neighbor = document.getElementById("mon-neighbor");
const mon_hop = document.getElementById("mon-hop");
const mon_total = document.getElementById("mon-total");

draw.addEventListener("click", () => {

    view.className = "";
    if (G.cy) G.cy.elements().remove();
    G.cy = null;

    const size = parseInt(size_input.value); 
    G.Matrix = getRandomMatrix(size); 
    G.Gdata = getGraphData(G.Matrix);
    G.cy = drawGraph(G.Gdata); 

    start.disabled = false;
})

start.addEventListener("click", () => {

    draw.disabled = true;
    start.disabled = true;
    G.speed = speed.value;

    Dijkstra(G.Matrix, 0)
        .then(res => 
        { 
            G.res = res;
            G.ready = true;
            draw.disabled = false;
        }
    )
})

const drawPath = async (node) => {

    const start = parseInt(node);
    G.cy.filter('edge.path').removeClass('path');
    G.cy.filter('node.start').removeClass('start');
    G.cy.filter('node.path').removeClass('path');
    G.cy.filter('edge.not-path').removeClass('not-path');
    G.cy.filter('node.not-path').removeClass('not-path');

    if (start == G.root || start > G.Matrix.length) return;

    G.cy.getElementById(start).addClass('start');
    const pathArr = Gpath(start, G.res.Hops); 
    let e = [], n = [start]

    for (let i = 1; i < pathArr.length; i++ ) {

        n1 = pathArr[i-1];
        n2 = pathArr[i];
        e.push(id(n1, n2));
        n.push(n2);
    }

    G.cy.edges().addClass('not-path');
    G.cy.nodes().addClass('not-path');

    for (let i = 0; i < e.length; i++ ) {

        G.cy.getElementById(e[i]).removeClass('not-path').addClass('path');
        await sleep(50);
        G.cy.getElementById(n[i]).removeClass('not-path').addClass('path');
        await sleep(100);
    }
}

const Dijkstra = async (Matrix, start) => {

    // Init
    let Qeue = [...Matrix[0].keys()];
    let Distances = new Array(Matrix.length).fill(-1);
    let Hops = new Array(Matrix.length).fill(null); 

    Distances[start] = 0;
    Hops[start] = -1;

    // Main
    while (Qeue.length) {

        // Get a vertice with the min distance to start from Queue
        let index = 0;
        let current = Qeue[index]; //console.log(Distances, Qeue)
        let min = Distances[current]; 
        
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

        await callback_current(current);
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
    const randEdge = () => Math.round(Math.random() - 0.2);
    const randDist = () => Math.floor(Math.random()*N + 1);

    for (let i = 0; i < N; i++) {
        M[i] = [];
        for (let j = 0; j < i; j++ ) M[i][j] = M[j][i];
        for (let j = i + 1; j < N; j++) M[i][j] = randEdge() ? randDist() : 0;
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

    const cy = cytoscape({

    container: document.getElementById('graph'),
  
    elements: data,
  
    layout: {
      name: 'random',
      animate: true, 
      animationDuration: 500,
      animationEasing: 'ease-in' 
    },
  
    style: [
      {
        selector: 'node',
        style: {
          'height': '12px',
          'width': '12px',
          'label': 'data(id)',
          'background-color': '#34465D',
          'font-size': '14px',
          'text-background-color': '#222',
          'text-background-opacity': 1,
          'color': '#fff',
          'text-background-padding': '3px',
        }
      },
      { 
        selector: 'edge',
        style: {
        //'curve-style': 'unbundled-bezier',
        'width': 1,
        'label': 'data(weight)',
        'line-color': '#34465D',
        'text-background-color': '#eee',
        'text-background-opacity': 1,
        'color': '#222',
        'text-background-padding': '2px',
        'font-size': '11px'
        }
      },
      {
        selector: '.current_node',
        css: {
                'background-color': '#BD081C',
                'width': '15px',
                'height': '15px'
            }
       },
       {
        selector: '.current_neighbor',
        css: {
                'line-color': '#DF2029',
                'width': 3,
            }
       },
       {
        selector: '.added_edge',
        css: {
                'line-color': '#1DA1F2',
                'width': 3
            }
       },
       {
        selector: '.path',
        css: {
                'line-color': '#FF3300',
                'width': 4
            }
       },
       {
        selector: '.root',
        css: {
                'background-color': '#25D366',
                'width': '20px',
                'height': '20px',
                'text-background-color': '#FF5700',
                'text-background-padding': '4px',
                'text-background-opacity': 1,
                'color': 'white'
            }
       },
    ]
  })

  cy.getElementById(G.root).style('label', 'ROOT').addClass('root');
  return cy;
}

const id = (one, two) => [one, two].sort((x, y) => x -y).join('-');

const callback_current = async current => {
    const c = G.cy.getElementById(current);
    c.addClass('current_node');
    await sleep(50);
}

const callback_neighbor_start = async (c, n) => { 

    let e = id(c, n); 
    G.cy.getElementById(e).addClass('current_neighbor');
    await sleep(150);
}

const callback_neighbor_end = async (c, n) => { 

    let e = id(c, n); 
    G.cy.getElementById(e).removeClass('current_neighbor'); 
    await sleep(20); 
}

const callback_hop = async (c, o, n) => { 

    let e = id(c, n);
    G.cy.getElementById(e).addClass('added_edge');

    e = id(n, o); console.log(c, o, e)
    G.cy.getElementById(e).removeClass('added_edge'); 

    await sleep(100);
}

const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const G = { root: 0, cy: null, Matrix: null, Gdata: null }

const size_input = document.getElementById("graph_size");
const draw = document.getElementById("draw");
const start = document.getElementById("start");
const dest = document.getElementById("dest");
const path = document.getElementById("path");

draw.addEventListener("click", () => {

    if (G.cy) G.cy.elements().remove();
    G.cy = null;
    path.disabled = true;

    const size = parseInt(size_input.value); 
    G.Matrix = getRandomMatrix(size); 
    G.Gdata = getGraphData(G.Matrix);
    G.cy = drawGraph(G.Gdata); 

    start.disabled = false;
})

start.addEventListener("click", () => {

    draw.disabled = true;
    start.disabled = true;
    Dijkstra(G.Matrix, 0)
        .then(res => { 
            G.res = res;
            path.disabled = false;
            draw.disabled = false;
        }
    )
})

path.addEventListener("click", () => {

    const destination = parseInt(dest.value); 
    if (destination == G.root) return;

    const pathArr = Gpath(destination, G.res.Hops); console.log(pathArr)
    let pathTo = [], e;

    for (let i = 1; i < pathArr.length; i++ ) {

        e = id(pathArr[i-1], pathArr[i]);
        pathTo.push(e);
        G.cy.getElementById(e).addClass('path');
        //await sleep(500);
    }
    console.log(pathTo)

})
   

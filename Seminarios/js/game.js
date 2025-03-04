let scene, camera, renderer, controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let board = []; // Estado del tablero (9 celdas)
let currentPlayer; // Se asigna aleatoriamente 'X' o 'O'
let cells = []; // Almacena las celdas (meshes) del tablero

// Configuración de colores (lil-gui actualizará estos valores)
const config = {
  xColor: "#ff0000",
  oColor: "#0000ff"
};

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);
  
  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  // Luces
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);
  
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('click', onMouseClick, false);
  
  createBoard();
  animate();
  
  // Configuración de lil-gui
  const gui = new lil.GUI();
  gui.addColor(config, 'xColor').name('Color X');
  gui.addColor(config, 'oColor').name('Color O');
  
  // Asignamos aleatoriamente quién comienza
  currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
  console.log("Empieza: " + currentPlayer);
}

// Crea el tablero 3x3 con separación entre celdas
function createBoard() {
  // Reiniciamos arrays
  cells = [];
  board = Array(9).fill(null);
  
  const cellSize = 2.2;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
      const geometry = new THREE.PlaneGeometry(2, 2);
      const cell = new THREE.Mesh(geometry, material);
      cell.rotation.x = -Math.PI / 2;
      cell.position.set((j - 1) * cellSize, 0, (i - 1) * cellSize);
      cell.userData.index = i * 3 + j;
      scene.add(cell);
      cells.push(cell);
    }
  }
}

// Verifica si hay ganador o empate
function checkWin() {
  const wins = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ];
  for (let condition of wins) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== null)) return 'Draw';
  return null;
}

// Coloca una figura (X o O) en la celda seleccionada
function placeFigure(index) {
  if (board[index]) return;
  board[index] = currentPlayer;
  const cell = cells[index];
  let figure;
  
  if (currentPlayer === 'X') {
    const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(config.xColor) });
    const geometry = new THREE.BoxGeometry(1.8, 0.2, 0.2);
    const bar1 = new THREE.Mesh(geometry, material);
    const bar2 = new THREE.Mesh(geometry, material);
    // Rotar las barras para formar una X; se ajusta para que queden planas sobre el tablero
    bar1.rotation.set(0, Math.PI / 4, 0);
    bar2.rotation.set(0, -Math.PI / 4, 0);
    figure = new THREE.Group();
    figure.add(bar1);
    figure.add(bar2);
  } else {
    const geometry = new THREE.TorusGeometry(0.8, 0.2, 16, 100);
    const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(config.oColor) });
    figure = new THREE.Mesh(geometry, material);
    figure.rotation.x = -Math.PI / 2; // Para que la O quede plana sobre el tablero
  }
  
  figure.position.set(cell.position.x, 0.1, cell.position.z);
  figure.scale.set(0.001, 0.001, 0.001);
  scene.add(figure);
  
  new TWEEN.Tween(figure.scale)
    .to({ x: 1, y: 1, z: 1 }, 500)
    .easing(TWEEN.Easing.Elastic.Out)
    .start();
  
  // Espera a que termine la animación para verificar el estado del juego
  setTimeout(() => {
    const result = checkWin();
    if (result) {
      endGame(result);
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      console.log("Turno: " + currentPlayer);
    }
  }, 600);
}

// Maneja el clic para colocar figuras
function onMouseClick(event) {
  // No responde si los menús están activos
  if (document.getElementById('menu').style.display !== 'none') return;
  if (document.getElementById('endMenu').style.display !== 'none') return;
  
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(cells);
  if (intersects.length > 0) {
    const cell = intersects[0].object;
    placeFigure(cell.userData.index);
  }
}

// Muestra el menú final
function endGame(result) {
  const endMenu = document.getElementById('endMenu');
  const endText = document.getElementById('endText');
  if (result === 'Draw') {
    endText.textContent = 'Empate';
  } else {
    endText.textContent = 'Ganador: ' + result;
  }
  endMenu.style.display = 'flex';
}

// Bucle de animación
function animate(time) {
  requestAnimationFrame(animate);
  TWEEN.update(time);
  controls.update();
  renderer.render(scene, camera);
}

// Ajuste al cambiar el tamaño de la ventana
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Reinicia el juego eliminando figuras y reiniciando el estado del tablero
function resetGame() {
  // Elimina todas las figuras, excepto las celdas (Planos)
  scene.children.slice().forEach(child => {
    if ((child.type === "Group") || (child.type === "Mesh" && child.geometry.type !== "PlaneGeometry")) {
      scene.remove(child);
    }
  });
  board = Array(9).fill(null);
  // Escoge aleatoriamente quién comienza en cada nueva partida
  currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
  console.log("Empieza: " + currentPlayer);
  document.getElementById('endMenu').style.display = 'none';
  createBoard();
}

// Eventos de los menús
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('menu').style.display = 'none';
  if (!renderer) init();
});
document.getElementById('restartBtn').addEventListener('click', resetGame);

// Inicialización de la escena
init();

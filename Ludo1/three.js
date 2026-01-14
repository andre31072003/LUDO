function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = modal.style.display === "block" ? "none" : "block";

    if (modalId === 'rulesModal' && modal.style.display === "block") {
        loadRules();
    }
}

function newGame() {
    document.getElementById('mainModal').style.display = 'none';
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('colorSelectionScreen').style.display = 'flex';
    resetPieces(); // Recriar peças
}



function loadRules() {
    fetch('regras.txt')
        .then(response => response.text())
        .then(data => {
            document.getElementById('rulesContent').innerText = data;
        })
        .catch(error => {
            document.getElementById('rulesContent').innerText = 'Erro ao carregar as regras';
            console.error('Erro ao carregar as regras:', error);
        });
}

function exitGame() {
    document.getElementById('mainModal').style.display = 'none';
    document.getElementById('colorSelectionScreen').style.display = 'none';
    document.getElementById('startScreen').style.display = 'flex';
    resetPieces();
}

function showColorSelection() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('colorSelectionScreen').style.display = 'flex';
}

function selectColor(color) {
    document.getElementById('colorSelectionScreen').style.display = 'none';
    currentPlayerIndex = playerColors.indexOf(color);
    startTurn(); // Inicia o jogo com a cor selecionada
    animatePieces();
}
document.addEventListener('keydown', (event) => {
    if (event.key === 'P') {
        togglePointLight();
    }
    if (event.key === 'O') {
        toggleDirectionalLight();
    }
});

let pointLightEnabled = true;
let directionalLightEnabled = true;

function togglePointLight() {
    pointLightEnabled = !pointLightEnabled;
    pointLight.visible = pointLightEnabled;
}

function toggleDirectionalLight() {
    directionalLightEnabled = !directionalLightEnabled;
    directionalLight.visible = directionalLightEnabled;
}

document.addEventListener('DOMContentLoaded', () => {
    const ambientLightSlider = document.getElementById('ambient-light-slider');
    const currentValueLabel = document.getElementById('current-value-label');

    // Adiciona um ouvinte de eventos para detectar mudanças no controle deslizante
    ambientLightSlider.addEventListener('input', function(event) {
        //o valor atual do controle deslizante
        const intensity = parseFloat(event.target.value);

        // Define a intensidade da luz ambiente como o valor do controle deslizante
        ambientLight.intensity = intensity;

        // Atualiza o valor
        currentValueLabel.textContent = ': ' + intensity;
    });
});

// Setup scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 300, 300);
camera.lookAt(0, 50, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de sombreamento
document.body.appendChild(renderer.domElement);


// Adicionar OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // transições mais suave
controls.dampingFactor = 0.05;

        // Adicionar luz ambiente
        const ambientLight = new THREE.AmbientLight(0x404040); // luz ambiente mais suave
        scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz branca, intensidade 1
        directionalLight.position.set(100, 300, 100); // Posição da luz
        directionalLight.castShadow = true; // Ativa as sombras
        directionalLight.shadow.camera.top = 500;
        directionalLight.shadow.camera.bottom = -500;
        directionalLight.shadow.camera.left = -500;
        directionalLight.shadow.camera.right = 500;
        directionalLight.shadow.mapSize.width = 2048; // Aumentar resolução do mapa de sombras
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Add point light
        const pointLight = new THREE.PointLight(0xff0000, 1, 500); // Luz vermelha, intensidade 1, distância 500
        pointLight.position.set(0, 300, 0); // Posição da luz
        pointLight.castShadow = true; // Ativar sombras
        pointLight.shadow.mapSize.width = 2048; // Aumentar resolução do mapa de sombras
        pointLight.shadow.mapSize.height = 2048;
        scene.add(pointLight);


let lightState = 'ambient';

window.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
        case 'p':
            toggleLight();
            break;
        case 'o':
            switchLight();
            break;
    }
});

function toggleLight() {
    if (lightState === 'ambient') {
        ambientLight.visible = !ambientLight.visible;
    } else if (lightState === 'directional') {
        directionalLight.visible = !directionalLight.visible;
    } else if (lightState === 'point') {
        pointLight.visible = !pointLight.visible;
    }
}

function switchLight() {
    if (lightState === 'ambient') {
        lightState = 'directional';
    } else if (lightState === 'directional') {
        lightState = 'point';
    } else {
        lightState = 'ambient';
    }
}

// Carregar a textura 360°
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('360image.jpg', () => {
    const sphereGeometry = new THREE.SphereGeometry(3000, 60, 40);
    sphereGeometry.scale(-1, 1, 1); // inverter a esfera para mostrar a textura dentro
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
});

// Criar board geometry
const woodTexture = textureLoader.load('tabuleiro.jpg');
const boardWidth = 400;
const boardHeight = 10;
const boardDepth = 400;
const boardGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, boardDepth);
const boardMaterial = new THREE.MeshStandardMaterial({ map: woodTexture, side: THREE.DoubleSide });
const board = new THREE.Mesh(boardGeometry, boardMaterial);
board.position.set(0, 50, 0); // Lift the board slightly
board.castShadow = true;
board.receiveShadow = true;
scene.add(board);



// Inicializa o loader GLTF
const loader = new THREE.GLTFLoader();

// URL do modelo GLTF/GLB
const modelUrl = 'tables_and_chairs.glb'; // Substitua com o URL do modelo real

// Carregar o modelo
loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;

    // Configurar sombras para cada filho do modelo importado
    model.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    model.position.set(-5650, -1700, 2230); // Ajuste a posição do modelo conforme necessário
    model.scale.set(850, 850, 850); // Ajuste a escala do modelo conforme necessário
    scene.add(model);
}, undefined, (error) => {
    console.error('Erro ao carregar o modelo:', error);
});


// Adicionar plataforma sob o tabuleiro
const platformWidth2 = 3000;
const platformHeight2 = 10;
const platformDepth2 = 3000;
const platformGeometry2 = new THREE.BoxGeometry(platformWidth2, platformHeight2, platformDepth2);

// Carregar a textura
const textureLoader3 = new THREE.TextureLoader();
const platformTexture = textureLoader3.load('ny.png'); 

// Criar o material com a textura carregada
const platformMaterial2 = new THREE.MeshBasicMaterial({ map: platformTexture });

// Criar a malha da plataforma
const platform2 = new THREE.Mesh(platformGeometry2, platformMaterial2);
platform2.position.set(0, -1000, 0);

// Rodar a plataforma para a direita (em torno do eixo Y)
const angleInDegrees = -90;
const angleInRadians = THREE.MathUtils.degToRad(angleInDegrees);
platform2.rotation.y = angleInRadians;
platform2.receiveShadow = true; // Receber sombras
scene.add(platform2);

// Criar board geometry com a mesma textura
const borderThickness = 10; // ajustar a grossura
const borderMaterial = new THREE.MeshStandardMaterial({ map: woodTexture, side: THREE.DoubleSide });
board.castShadow = true;
        board.receiveShadow = true;
        

// Front border
const borderGeometryFront = new THREE.BoxGeometry(boardWidth + borderThickness * 2, borderThickness, borderThickness);
const borderFront = new THREE.Mesh(borderGeometryFront, borderMaterial);
borderFront.position.z = (boardDepth + borderThickness) / 2;
board.add(borderFront);
board.castShadow = true;
board.receiveShadow = true;

// Back border
const borderGeometryBack = new THREE.BoxGeometry(boardWidth + borderThickness * 2, borderThickness, borderThickness);
const borderBack = new THREE.Mesh(borderGeometryBack, borderMaterial);
borderBack.position.z = -(boardDepth + borderThickness) / 2;
board.add(borderBack);
board.castShadow = true;
board.receiveShadow = true;

//Bottom border
const borderGeometryBottom = new THREE.BoxGeometry(boardWidth + borderThickness * 2, borderThickness, borderThickness);
const borderBottom = new THREE.Mesh(borderGeometryBottom, borderMaterial);
borderBottom.position.y = -(boardHeight + borderThickness) / 2;
board.add(borderBottom);
board.castShadow = true;
        board.receiveShadow = true;

//left border
const borderGeometryLeft = new THREE.BoxGeometry(borderThickness, borderThickness, boardDepth);
const borderLeft = new THREE.Mesh(borderGeometryLeft, borderMaterial);
borderLeft.position.x = -(boardWidth + borderThickness) / 2;
board.add(borderLeft);
board.castShadow = true;
        board.receiveShadow = true;

//right border
const borderGeometryRight = new THREE.BoxGeometry(borderThickness, borderThickness, boardDepth);
const borderRight = new THREE.Mesh(borderGeometryRight, borderMaterial);
borderRight.position.x = (boardWidth + borderThickness) / 2;
board.add(borderRight);
board.castShadow = true;
        board.receiveShadow = true;

// Adicionar plataforma debaixo
const platformWidth = 600;
const platformHeight = 10;
const platformDepth = 600;
const platformGeometry = new THREE.BoxGeometry(platformWidth, platformHeight, platformDepth);
const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown color
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.position.set(0, 45, 0);
platform.castShadow = true;
platform.receiveShadow = true;
scene.add(platform);

// Criar bases
const baseGeometry = new THREE.BoxGeometry(90, 10, 90);

const baseMaterial1 = new THREE.MeshStandardMaterial({ color: 0x0000FF }); // AZUL
const base1 = new THREE.Mesh(baseGeometry, baseMaterial1);
base1.position.set(-125, 5, 125);
base1.castShadow = true;
base1.receiveShadow = true;
board.add(base1);

const baseMaterial2 = new THREE.MeshStandardMaterial({ color: 0xFFFF00 }); // AMARELA
        const base2 = new THREE.Mesh(baseGeometry, baseMaterial2);
        base2.position.set(125, 5, 125);
        base2.castShadow = true;
        base2.receiveShadow = true;
        board.add(base2);

        const baseMaterial3 = new THREE.MeshStandardMaterial({ color: 0xFF0000 }); // VERMELHA
        const base3 = new THREE.Mesh(baseGeometry, baseMaterial3);
        base3.position.set(125, 5, -125);
        base3.castShadow = true;
        base3.receiveShadow = true;
        board.add(base3);

        const baseMaterial4 = new THREE.MeshStandardMaterial({ color: 0x046C04 }); // VERDE
        const base4 = new THREE.Mesh(baseGeometry, baseMaterial4);
        base4.position.set(-125, 5, -125);
        base4.castShadow = true;
        base4.receiveShadow = true;
        board.add(base4);

        // Criar cubo central
        const faceTexture = textureLoader.load('face.jpg');

        const materials = [
            new THREE.MeshStandardMaterial({ color: 0xFFFF00 }), // amarelo
            new THREE.MeshStandardMaterial({ color: 0x046C04 }), // verde
            new THREE.MeshStandardMaterial({ map: faceTexture }), //textura
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF }), // branco
            new THREE.MeshStandardMaterial({ color: 0x0000FF }), // azul
            new THREE.MeshStandardMaterial({ color: 0xFF0000 })  // vermelho
        ];

        const centralCubeGeometry = new THREE.BoxGeometry(85, 25, 85);
        const centralCube = new THREE.Mesh(centralCubeGeometry, materials);
        centralCube.position.set(0, 18, 0);
        centralCube.castShadow = true;
        centralCube.receiveShadow = true;
        board.add(centralCube);

        // Funcao para criar os quadrados
        function createSquare(color) {
            const squareGeometry = new THREE.BoxGeometry(20, 1, 20);
            const squareMaterial = new THREE.MeshStandardMaterial({ color: color });
            const square = new THREE.Mesh(squareGeometry, squareMaterial);
            square.castShadow = true;
            square.receiveShadow = true;
            return square;
        }

// Adicionar quadrados especificos
let yellowStartSquare = createSquare(0xFFFF00); // inicio quadrado amarelo
yellowStartSquare.position.set(180, 5, 30);
board.add(yellowStartSquare);

let greenStartSquare = createSquare(0x046C04); // inicio quadrado verde
greenStartSquare.position.set(-180, 5, -30);
board.add(greenStartSquare);

let redStartSquare = createSquare(0xFF0000); // inicio quadrado vermelho
redStartSquare.position.set(30, 5, -180);
board.add(redStartSquare);

let blueStartSquare = createSquare(0x0000FF); // inicio quadrado azul
blueStartSquare.position.set(-30, 5, 180);
board.add(blueStartSquare);

// Criar o quadrado do amarelo na posicao(155, 60, 30)
let targetYellowSquare = createSquare(0xFFFF00); // amarelo
targetYellowSquare.position.set(155, 5.5, 30);
board.add(targetYellowSquare);

// Criar o quadrado do azul na posicao (-30, 6, 155)
let targetBlueSquare = createSquare(0x0000FF); // azul
targetBlueSquare.position.set(-30, 5.5, 155);
board.add(targetBlueSquare);

// Criar o quadrado do vermelho na posicao (-30, 6, 155)
let targetRedSquare = createSquare(0xFF0000); // Red
targetRedSquare.position.set(30, 5.5, -155);
board.add(targetRedSquare);

// Criar o quadrado do verde na posicao (-155, 6, -30)
let targetGreenSquare = createSquare(0x046C04); // Green
targetGreenSquare.position.set(-155, 5.5, -30);
board.add(targetGreenSquare);

// Criar o resto dos quadrados e adicionar no board 
// Entre as bases do azul e do amarelo
let square1 = createSquare(0xFFFFFF); // White
square1.position.set(-30, 5, 180);
board.add(square1);

let square2 = createSquare(0xFFFFFF); 
square2.position.set(0, 5, 180);
board.add(square2);

let square3 = createSquare(0xFFFFFF); 
square3.position.set(30, 5, 180);
board.add(square3);

// adicionar mais quadrados entre as bases azuul e amarela ate ao centro
for (let i = 2; i <= 5; i++) {
    let square = createSquare(0xFFFFFF);
    square.position.set(-30, 5, 180 - i * 25);
    board.add(square);
}
for (let i = 1; i <= 5; i++) {
    let square = createSquare(0x0000FF);
    square.position.set(0, 5, 180 - i * 25);
    board.add(square);

    square = createSquare(0xFFFFFF);
    square.position.set(30, 5, 180 - i * 25);
    board.add(square);
}

square = createSquare(0xFFFFFF);
square.position.set(55, 5, 55);
board.add(square);

// Entre as bases do amarelo e do vermelho
square1 = createSquare(0xFFFFFF); // White
square1.position.set(180, 5, 30);
board.add(square1);

square2 = createSquare(0xFFFFFF); // White
square2.position.set(180, 5, 0);
board.add(square2);

square3 = createSquare(0xFFFFFF); // White
square3.position.set(180, 5, -30);
board.add(square3);

// adicionar mais quadrados entre as bases amarelo e vermelho ate ao centro
for (let i = 2; i <= 5; i++) {
    let square = createSquare(0xFFFFFF);
    square.position.set(180 - i * 25, 5, 30);
    board.add(square);
}
for(let i = 1; i <= 5; i++) {
    let square = createSquare(0xFFFF00);
    square.position.set(180 - i * 25, 5, 0);
    board.add(square);

    square = createSquare(0xFFFFFF);
    square.position.set(180 - i * 25, 5, -30);
    board.add(square);
}

square = createSquare(0xFFFFFF);
square.position.set(-55, 5, -55);
board.add(square);

// Entre as bases do vermelho e do verde
square1 = createSquare(0xFFFFFF); // White
square1.position.set(30, 5, -180);
board.add(square1);

square2 = createSquare(0xFFFFFF); // White
square2.position.set(0, 5, -180);
board.add(square2);

square3 = createSquare(0xFFFFFF); // White
square3.position.set(-30, 5, -180);
board.add(square3);

// adicionar mais quadrados entre as bases vermelho e verde ate ao centro
for (let i = 2; i <= 5; i++) {
    let square = createSquare(0xFFFFFF);
    square.position.set(30, 5, -180 + i * 25);
    board.add(square);
}
for (let i = 1; i <= 5; i++) {
    let square = createSquare(0xFF0000);
    square.position.set(0, 5, -180 + i * 25);
    board.add(square);

    square = createSquare(0xFFFFFF);
    square.position.set(-30, 5, -180 + i * 25);
    board.add(square);
}

square = createSquare(0xFFFFFF);
square.position.set(55, 5, -55);
board.add(square);

// Entre as bases do verde e do azul
square1 = createSquare(0xFFFFFF); // White
square1.position.set(-180, 5, -30);
board.add(square1);

square2 = createSquare(0xFFFFFF); // White
square2.position.set(-180, 5, 0);
board.add(square2);

square3 = createSquare(0xFFFFFF); // White
square3.position.set(-180, 5, 30);
board.add(square3);

// adicionar mais quadrados entre as bases verde e azul ate ao centro
for (let i = 2; i <= 5; i++) {
    let square = createSquare(0xFFFFFF);
    square.position.set(-180 + i * 25, 5, -30);
    board.add(square);
}
for(let i = 1; i <= 5; i++) {
    let square = createSquare(0x046C04);
    square.position.set(-180 + i * 25, 5, 0);
    board.add(square);

    square = createSquare(0xFFFFFF);
    square.position.set(-180 + i * 25, 5, 30);
    board.add(square);
}
square = createSquare(0xFFFFFF);
square.position.set(-55, 5, 55);
board.add(square);

        // Função para criar peça amarela
        function createYellowLudoPiece() {
            const piece = createLudoPiece(0xEBE21B);
            // Adicionar óculos de sol
            var glassesGeometry = new THREE.CircleGeometry(2, 32);
            var glassesMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            var glassesLeft = new THREE.Mesh(glassesGeometry, glassesMaterial);
            var glassesRight = new THREE.Mesh(glassesGeometry, glassesMaterial);
            glassesLeft.position.set(-2, 22, 6);
            glassesRight.position.set(2, 22, 6);

            // Adicionar hastes dos óculos
            var templeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 6, 32);
            var templeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
            var leftTemple = new THREE.Mesh(templeGeometry, templeMaterial);
            var rightTemple = new THREE.Mesh(templeGeometry, templeMaterial);
            leftTemple.position.set(-4, 20, 5);
            rightTemple.position.set(4, 20, 5);
            leftTemple.rotation.y = Math.PI / 2; 
            leftTemple.rotation.x = 0;
            leftTemple.rotation.z = Math.PI / 3; 
            rightTemple.rotation.y = Math.PI / 2; 
            rightTemple.rotation.x = 0;
            rightTemple.rotation.z = Math.PI / 3; 

            // Criar vassoura
            var broomHandleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 35, 32);
            var broomHandleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Castanho
            var broomHandle = new THREE.Mesh(broomHandleGeometry, broomHandleMaterial);
            broomHandle.position.set(10, 12, 2); // Posicionar o cabo da vassoura
            broomHandle.rotation.y = Math.PI / 2; // Ajusta a orientação da lâmina para que fique de frente para a câmera
            broomHandle.rotation.x = 0;
            broomHandle.rotation.z = Math.PI / 6; // Rotacionar a espada em torno do eixo x
            
            var broomHeadGeometry = new THREE.CylinderGeometry(7, 7, 7, 42);
            var broomHeadMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Cinza
            var broomHead = new THREE.Mesh(broomHeadGeometry, broomHeadMaterial);
            broomHead.position.set(10, 25, 12); // Posicionar a cabeça da vassoura
            broomHead.rotation.y = Math.PI / 2; // Ajusta a orientação da lâmina para que fique de frente para a câmera
            broomHead.rotation.x = 0;
            broomHead.rotation.z = Math.PI / 6; // Rotacionar a espada em torno do eixo x

            // Criar mão esquerda (esfera)
            var leftHandGeometry = new THREE.SphereGeometry(3, 32, 32);
            var leftHandMaterial = new THREE.MeshStandardMaterial({ color: 0xEBE21B }); // Amarelo
            var leftHand = new THREE.Mesh(leftHandGeometry, leftHandMaterial);
            leftHand.position.set(-10, 7.5, 0); // Posicionar a mão esquerda

            // Criar mão direita (esfera)
            var rightHandGeometry = new THREE.SphereGeometry(3, 32, 32);
            var rightHandMaterial = new THREE.MeshStandardMaterial({ color: 0xEBE21B }); // Amarelo
            var rightHand = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
            rightHand.position.set(10, 7.5, 0); // Posicionar a mão direita

            piece.add(glassesLeft);
            piece.add(glassesRight);
            piece.add(leftTemple);
            piece.add(rightTemple);
            piece.add(broomHandle);
            piece.add(broomHead);
            piece.add(leftHand);
            piece.add(rightHand);

            piece.castShadow = true;
            piece.receiveShadow = true;

            return piece;
        }

        function createLudoPiece(color) {
            const pieceGeometry = new THREE.Group();

            const baseGeometry = new THREE.CylinderGeometry(10, 10, 5, 64);
            const baseMaterial = new THREE.MeshStandardMaterial({ color });
            const base = new THREE.Mesh(baseGeometry, baseMaterial);
            base.castShadow = true;
            base.receiveShadow = true;

            const bodyGeometry = new THREE.CylinderGeometry(3, 5, 20, 32);
            const bodyMaterial = new THREE.MeshStandardMaterial({ color });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 7.5;
            body.castShadow = true;
            body.receiveShadow = true;

            const headGeometry = new THREE.SphereGeometry(6, 32, 32);
            const headMaterial = new THREE.MeshStandardMaterial({ color });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 20;
            head.castShadow = true;
            head.receiveShadow = true;

            pieceGeometry.add(base);
            pieceGeometry.add(body);
            pieceGeometry.add(head);

            pieceGeometry.castShadow = true;
            pieceGeometry.receiveShadow = true;

            return pieceGeometry;
        }

        const yellowPieces = [];
        const yellowPositions = [
            { x: 140, y:60, z: 140 },
            { x: 110, y:60, z: 140 },
            { x: 140, y:60, z: 110 },
            { x: 110, y:60, z: 110 }
        ];

        yellowPositions.forEach((pos, index) => {
            const piece = createYellowLudoPiece();
            piece.position.set(pos.x, pos.y, pos.z);
            piece.scale.set(1.2, 1.2, 1.2); // Uniform scaling
            piece.userData = { currentPositionIndex: 0 }; // Adicionar userData para cada peça
            scene.add(piece);
            yellowPieces.push(piece);
        });

        // Adicionar quatro peças na base azul
        function create4BlueLudoPiece() {
            var piece = createLudoPiece(0x2527C0);

            // Criar chapéu de palhaço
            var hatTopGeometry = new THREE.ConeGeometry(8, 12, 32);
            var hatTopMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Amarelo
            var hatTop = new THREE.Mesh(hatTopGeometry, hatTopMaterial);
            hatTop.position.y = 29.5; // Posicionar o topo do chapéu acima da cabeça

            var hatBallGeometry = new THREE.SphereGeometry(2, 32, 32);
            var hatBallMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Vermelho
            var hatBall = new THREE.Mesh(hatBallGeometry, hatBallMaterial);
            hatBall.position.y = 37; // Posicionar a bola vermelha no topo do chapéu

            // Criar nariz de palhaço
            var noseGeometry = new THREE.SphereGeometry(2, 32, 32);
            var noseMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Vermelho
            var nose = new THREE.Mesh(noseGeometry, noseMaterial);
            nose.position.y = 19; // Posicionar o nariz abaixo do topo da cabeça
            nose.position.z = 7; // Posicionar o nariz para frente

            // Criar taco de beisebol
            var batGeometry = new THREE.CylinderGeometry(1, 2, 30, 32); // Raio inicial de 1, raio final de 2, altura de 30
            var batMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Castanho
            var bat = new THREE.Mesh(batGeometry, batMaterial);
            bat.position.set(10, 7, 13.2); // Posicionar o taco na mão direita
            bat.rotation.x = -Math.PI / 2; // Rotacionar o taco para cima

            // Criar mão esquerda (esfera)
            var leftHandGeometry = new THREE.SphereGeometry(3, 32, 32);
            var leftHandMaterial = new THREE.MeshStandardMaterial({ color: 0x2527C0 }); // Branco
            var leftHand = new THREE.Mesh(leftHandGeometry, leftHandMaterial);
            leftHand.position.set(-10, 7.5, 0); // Posicionar a mão esquerda

            // Criar mão direita (esfera)
            var rightHandGeometry = new THREE.SphereGeometry(3, 32, 32);
            var rightHandMaterial = new THREE.MeshStandardMaterial({ color: 0x2527C0 }); // Branco
            var rightHand = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
            rightHand.position.set(10, 7.5, 0); // Posicionar a mão direita

            piece.add(hatTop);
            piece.add(hatBall);
            piece.add(nose);
            piece.add(bat);
            piece.add(leftHand);
            piece.add(rightHand);

            piece.castShadow = true;
            piece.receiveShadow = true;

            return piece;
        }

        const bluePieces = [];
        const bluePositions = [
            { x: -140, y:60, z: 140 },
            { x: -110, y:60, z: 140 },
            { x: -140, y:60, z: 110 },
            { x: -110, y:60, z: 110 }
        ];

        bluePositions.forEach((pos, index) => {
            const piece = create4BlueLudoPiece();
            piece.position.set(pos.x, pos.y, pos.z);
            piece.scale.set(1.2, 1.2, 1.2); // Escala Uniforme
            piece.userData = { currentPositionIndex: 0 }; // Adicionar userData para cada peça
            scene.add(piece);
            bluePieces.push(piece);
        });

        // Adicionar quatro peças na base vermelha
        function create4RedLudoPiece() {
            var piece = createLudoPiece(0xDE3C1F);

            var leftHandGeometry = new THREE.SphereGeometry(3, 32, 32);
            var leftHandMaterial = new THREE.MeshStandardMaterial({ color: 0xDE3C1F }); // Vermelho
            var leftHand = new THREE.Mesh(leftHandGeometry, leftHandMaterial);
            leftHand.position.set(-10, 7.5, 0);

            var rightHandGeometry = new THREE.SphereGeometry(3, 32, 32);
            var rightHandMaterial = new THREE.MeshStandardMaterial({ color: 0xDE3C1F }); // Vermelho
            var rightHand = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
            rightHand.position.set(10, 7.5, 0);

            // Criar chapéu de palha
            var hatTopGeometry = new THREE.CylinderGeometry(7, 7, 5, 32); // Cilindro maior para a parte superior do chapéu
            var hatBottomGeometry = new THREE.CylinderGeometry(8, 8, 2, 32); // Cilindro menor para a aba do chapéu
            var hatTopMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
            var hatBottomMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
            var hatTop = new THREE.Mesh(hatTopGeometry, hatTopMaterial);
            var hatBottom = new THREE.Mesh(hatBottomGeometry, hatBottomMaterial);
            hatTop.position.y = 27; // Posicionar a parte superior do chapéu acima da cabeça
            hatBottom.position.y = 23; // Posicionar a aba do chapéu abaixo da parte superior

            // Criar fita laranja para o chapéu
            var ribbonGeometry = new THREE.CylinderGeometry(7, 7, 0.5, 32);
            var ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
            var ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
            ribbon.position.y = 24.75; // Aumentei a posição Y para 28 para a fita ficar um pouco mais para fora

            // Criar espada (lâmina)
            var swordBladeGeometry = new THREE.BoxGeometry(30, 1, 1);
            var swordBladeMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Cinza
            var swordBlade = new THREE.Mesh(swordBladeGeometry, swordBladeMaterial);
            swordBlade.position.set(10, 17, -16);
            swordBlade.rotation.z = Math.PI / 6; // Rotacionar a espada em torno do eixo x
            swordBlade.rotation.y = Math.PI / 2; // Ajusta a orientação da lâmina para que fique de frente para a câmera

            // Criar cabo da espada
            var handleGeometry = new THREE.BoxGeometry(6, 2, 2);
            var handleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Castanho
            var handle = new THREE.Mesh(handleGeometry, handleMaterial);
            handle.position.set(10, 7.5, 0);
            handle.rotation.z = Math.PI / 6; // Rotacionar o cabo em torno do eixo x
            handle.rotation.y = Math.PI / 2; // Ajusta a orientação da lâmina para que fique de frente para a câmera

            piece.add(leftHand);
            piece.add(rightHand);
            piece.add(hatTop); // Adicionando o chapéu ao grupo
            piece.add(hatBottom); // Adicionando a aba do chapéu ao grupo
            piece.add(ribbon); // Adicionando a fita ao grupo
            piece.add(swordBlade); // Adicionando a lâmina da espada ao grupo
            piece.add(handle); // Adicionando o cabo da espada ao grupo

            piece.castShadow = true;
            piece.receiveShadow = true;

            return piece;
        }

        const redPieces = [];
        const redPositions = [
            { x: 140, y:60, z: -140 },
            { x: 110, y:60, z: -140 },
            { x: 140, y:60, z: -110 },
            { x: 110, y:60, z: -110 }
        ];

        redPositions.forEach((pos, index) => {
            const piece = create4RedLudoPiece();
            piece.position.set(pos.x, pos.y, pos.z);
            piece.scale.set(1.2, 1.2, 1.2); // Escala Uniforme
            piece.userData = { currentPositionIndex: 0 }; // Adicionar userData para cada peça
            scene.add(piece);
            redPieces.push(piece);
        });

        // Adicionar quatro peças na base verde
        function create4GreenLudoPiece() {
            var piece = createLudoPiece(0x00ff00);

            // Adicionar "bucket hat"
            var hatGeometry = new THREE.CylinderGeometry(7, 15, 10, 64, 1, true); // Raio de cima, raio de baixo, altura
            var hatMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Amarelo
            var hat = new THREE.Mesh(hatGeometry, hatMaterial);
            hat.position.y = 25; // Altura acima da cabeça

            // Adicionar lança
            var spearShaftGeometry = new THREE.CylinderGeometry(1, 0.5, 30, 32);
            var spearShaftMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Marrom
            var spearShaft = new THREE.Mesh(spearShaftGeometry, spearShaftMaterial);
            spearShaft.position.set(2.5, 8, 13.2); // Posição relativa à cabeça
            spearShaft.rotation.x = Math.PI / 2; // Rotacionar a lança para estar de frente
            spearShaft.rotation.z = Math.PI / 6; // Ajustar a inclinação

            var spearTipGeometry = new THREE.ConeGeometry(2, 6, 32);
            var spearTipMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Cinza
            var spearTip = new THREE.Mesh(spearTipGeometry, spearTipMaterial);
            spearTip.position.set(-5, 8, 29); // Posição relativa à cabeça
            spearTip.rotation.x = Math.PI / 2; // Rotacionar a ponta da lança para estar de frente

            var leftHandGeometry = new THREE.SphereGeometry(3, 32, 32);
            var leftHandMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Verde
            var leftHand = new THREE.Mesh(leftHandGeometry, leftHandMaterial);
            leftHand.position.set(-10, 7.5, 0);

            var rightHandGeometry = new THREE.SphereGeometry(3, 32, 32);
            var rightHandMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Verde
            var rightHand = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
            rightHand.position.set(10, 7.5, 0);

            piece.add(hat);
            piece.add(spearShaft);
            piece.add(spearTip);
            piece.add(leftHand);
            piece.add(rightHand);

            piece.castShadow = true;
            piece.receiveShadow = true;

            return piece;
        }

        const greenPieces = [];
        const greenPositions = [
            { x: -140, y:60, z: -140 },
            { x: -110, y:60, z: -140 },
            { x: -140, y:60, z: -110 },
            { x: -110, y:60, z: -110 }
        ];

        greenPositions.forEach((pos, index) => {
            const piece = create4GreenLudoPiece();
            piece.position.set(pos.x, pos.y, pos.z);
            piece.scale.set(1.2, 1.2, 1.2); // Escala Uniforme
            piece.userData = { currentPositionIndex: 0 }; // Adicionar userData para cada peça
            scene.add(piece);
            greenPieces.push(piece);
        });

function animatePieces() {
    const allPieces = [...yellowPieces, ...bluePieces, ...redPieces, ...greenPieces];
    allPieces.forEach(piece => {
        gsap.to(piece.position, {
            duration: 1,
            y: piece.position.y + 30,
            ease: "power1.inOut",
            yoyo: true,
            repeat: 1
        });
        gsap.to(piece.rotation, {
            duration: 1,
            y: piece.rotation.y + Math.PI * 2,
            ease: "power1.inOut",
            yoyo: true,
            repeat: 1
        });
    });
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let diceResult = 0; // Variável global para armazenar o resultado do dado
let selectedPiece = null; // Variável global para armazenar a peça selecionada
let isDiceRolled = false; // Adicionar variável para controlar se o dado foi rolado

const paths = {
    yellow: [
        new THREE.Vector3(155, 60, 30), //  Quadrado inicial
        new THREE.Vector3(130, 60, 30),
        new THREE.Vector3(105, 60, 30),
        new THREE.Vector3(80, 60, 30),
        new THREE.Vector3(55, 60, 30),
        new THREE.Vector3(55, 60, 55),
        new THREE.Vector3(30, 60, 55),
        new THREE.Vector3(30, 60, 80),
        new THREE.Vector3(30, 60, 105),
        new THREE.Vector3(30, 60, 130),
        new THREE.Vector3(30, 60, 155),
        new THREE.Vector3(30, 60, 180),
        new THREE.Vector3(0, 60, 180),   //Lado amarelo ate ao lado azul

        new THREE.Vector3(-30, 60, 180),
        new THREE.Vector3(-30, 60, 155),
        new THREE.Vector3(-30, 60, 130),
        new THREE.Vector3(-30, 60, 105),
        new THREE.Vector3(-30, 60, 80),
        new THREE.Vector3(-30, 60, 55),
        new THREE.Vector3(-55, 60, 55),
        new THREE.Vector3(-55, 60, 30),
        new THREE.Vector3(-80, 60, 30),
        new THREE.Vector3(-105, 60, 30),
        new THREE.Vector3(-130, 60, 30),
        new THREE.Vector3(-155, 60, 30),
        new THREE.Vector3(-180, 60, 30),
        new THREE.Vector3(-180, 60, 0),  //lado azul ate al lado amarelo

        new THREE.Vector3(-180, 60, -30),
        new THREE.Vector3(-155, 60, -30),
        new THREE.Vector3(-130, 60, -30),
        new THREE.Vector3(-105, 60, -30),
        new THREE.Vector3(-80, 60, -30),
        new THREE.Vector3(-55, 60, -30),
        new THREE.Vector3(-55, 60, -55),
        new THREE.Vector3(-30, 60, -55),
        new THREE.Vector3(-30, 60, -80),
        new THREE.Vector3(-30, 60, -105),
        new THREE.Vector3(-30, 60, -130),
        new THREE.Vector3(-30, 60, -155),
        new THREE.Vector3(-30, 60, -180),
        new THREE.Vector3(0, 60, -180),  //Lado verde ate ao lado vermelho

        new THREE.Vector3(30, 60, -180),
        new THREE.Vector3(30, 60, -155),
        new THREE.Vector3(30, 60, -130),
        new THREE.Vector3(30, 60, -105),
        new THREE.Vector3(30, 60, -80),
        new THREE.Vector3(30, 60, -55),
        new THREE.Vector3(55, 60, -55),
        new THREE.Vector3(55, 60, -30),
        new THREE.Vector3(80, 60, -30),
        new THREE.Vector3(105, 60, -30),
        new THREE.Vector3(130, 60, -30),
        new THREE.Vector3(155, 60, -30),
        new THREE.Vector3(180, 60, -30), 
        new THREE.Vector3(180, 60, 0),   //Lado vermelho ate ao lado amarelo

        new THREE.Vector3(155, 60, 0),
        new THREE.Vector3(130, 60, 0),
        new THREE.Vector3(105, 60, 0),
        new THREE.Vector3(80, 60, 0),
        new THREE.Vector3(55, 60, 0),
        new THREE.Vector3(30, 85, 0),   //Ate ao centro para ganhar
    ],
    blue: [
        new THREE.Vector3(-30, 60, 155), // Quadrado inicial
        new THREE.Vector3(-30, 60, 130),
        new THREE.Vector3(-30, 60, 105),
        new THREE.Vector3(-30, 60, 80),
        new THREE.Vector3(-30, 60, 55),
        new THREE.Vector3(-55, 60, 55),
        new THREE.Vector3(-55, 60, 30),
        new THREE.Vector3(-80, 60, 30),
        new THREE.Vector3(-105, 60, 30),
        new THREE.Vector3(-130, 60, 30),
        new THREE.Vector3(-155, 60, 30),
        new THREE.Vector3(-180, 60, 30),
        new THREE.Vector3(-180, 60, 0), // Lado azul até ao lado amarelo

        new THREE.Vector3(-180, 60, -30),
        new THREE.Vector3(-155, 60, -30),
        new THREE.Vector3(-130, 60, -30),
        new THREE.Vector3(-105, 60, -30),
        new THREE.Vector3(-80, 60, -30),
        new THREE.Vector3(-55, 60, -30),
        new THREE.Vector3(-55, 60, -55),
        new THREE.Vector3(-30, 60, -55),
        new THREE.Vector3(-30, 60, -80),
        new THREE.Vector3(-30, 60, -105),
        new THREE.Vector3(-30, 60, -130),
        new THREE.Vector3(-30, 60, -155),
        new THREE.Vector3(-30, 60, -180),
        new THREE.Vector3(0, 60, -180), // Lado verde até ao lado vermelho

        new THREE.Vector3(30, 60, -180),
        new THREE.Vector3(30, 60, -155),
        new THREE.Vector3(30, 60, -130),
        new THREE.Vector3(30, 60, -105),
        new THREE.Vector3(30, 60, -80),
        new THREE.Vector3(30, 60, -55),
        new THREE.Vector3(55, 60, -55),
        new THREE.Vector3(55, 60, -30),
        new THREE.Vector3(80, 60, -30),
        new THREE.Vector3(105, 60, -30),
        new THREE.Vector3(130, 60, -30),
        new THREE.Vector3(155, 60, -30),
        new THREE.Vector3(180, 60, -30),
        new THREE.Vector3(180, 60, 0), // Lado vermelho até ao lado amarelo

        new THREE.Vector3(180, 60, 30),
        new THREE.Vector3(155, 60, 30),
        new THREE.Vector3(130, 60, 30),
        new THREE.Vector3(105, 60, 30),
        new THREE.Vector3(80, 60, 30),
        new THREE.Vector3(55, 60, 30),
        new THREE.Vector3(55, 60, 55),
        new THREE.Vector3(30, 60, 55),
        new THREE.Vector3(30, 60, 80),
        new THREE.Vector3(30, 60, 105),
        new THREE.Vector3(30, 60, 130),
        new THREE.Vector3(30, 60, 155),
        new THREE.Vector3(30, 60, 180),
        new THREE.Vector3(0, 60, 180), // Lado amarelo até ao lado azul

        new THREE.Vector3(0, 60, 155),
        new THREE.Vector3(0, 60, 130),
        new THREE.Vector3(0, 60, 105),
        new THREE.Vector3(0, 60, 80),
        new THREE.Vector3(0, 60, 55),
        new THREE.Vector3(0, 85, 30) // Até ao centro para ganhar
    ],
    red: [
        new THREE.Vector3(30, 60, -155), // Quadrado inicial
        new THREE.Vector3(30, 60, -130),
        new THREE.Vector3(30, 60, -105),
        new THREE.Vector3(30, 60, -80),
        new THREE.Vector3(30, 60, -55),
        new THREE.Vector3(55, 60, -55),
        new THREE.Vector3(55, 60, -30),
        new THREE.Vector3(80, 60, -30),
        new THREE.Vector3(105, 60, -30),
        new THREE.Vector3(130, 60, -30),
        new THREE.Vector3(155, 60, -30),
        new THREE.Vector3(180, 60, -30),
        new THREE.Vector3(180, 60, 0), // Lado vermelho até ao lado amarelo

        new THREE.Vector3(180, 60, 30),
        new THREE.Vector3(155, 60, 30),
        new THREE.Vector3(130, 60, 30),
        new THREE.Vector3(105, 60, 30),
        new THREE.Vector3(80, 60, 30),
        new THREE.Vector3(55, 60, 30),
        new THREE.Vector3(55, 60, 55),
        new THREE.Vector3(30, 60, 55),
        new THREE.Vector3(30, 60, 80),
        new THREE.Vector3(30, 60, 105),
        new THREE.Vector3(30, 60, 130),
        new THREE.Vector3(30, 60, 155),
        new THREE.Vector3(30, 60, 180),
        new THREE.Vector3(0, 60, 180), // Lado amarelo até ao lado azul

        new THREE.Vector3(-30, 60, 180),
        new THREE.Vector3(-30, 60, 155),
        new THREE.Vector3(-30, 60, 130),
        new THREE.Vector3(-30, 60, 105),
        new THREE.Vector3(-30, 60, 80),
        new THREE.Vector3(-30, 60, 55),
        new THREE.Vector3(-55, 60, 55),
        new THREE.Vector3(-55, 60, 30),
        new THREE.Vector3(-80, 60, 30),
        new THREE.Vector3(-105, 60, 30),
        new THREE.Vector3(-130, 60, 30),
        new THREE.Vector3(-155, 60, 30),
        new THREE.Vector3(-180, 60, 30),
        new THREE.Vector3(-180, 60, 0), // Lado azul até ao lado verde

        new THREE.Vector3(-180, 60, -30),
        new THREE.Vector3(-155, 60, -30),
        new THREE.Vector3(-130, 60, -30),
        new THREE.Vector3(-105, 60, -30),
        new THREE.Vector3(-80, 60, -30),
        new THREE.Vector3(-55, 60, -30),
        new THREE.Vector3(-55, 60, -55),
        new THREE.Vector3(-30, 60, -55),
        new THREE.Vector3(-30, 60, -80),
        new THREE.Vector3(-30, 60, -105),
        new THREE.Vector3(-30, 60, -130),
        new THREE.Vector3(-30, 60, -155),
        new THREE.Vector3(-30, 60, -180),
        new THREE.Vector3(0, 60, -180),  // Lado verde até ao lado vermelho

        new THREE.Vector3(0, 60, -155),
        new THREE.Vector3(0, 60, -130),
        new THREE.Vector3(0, 60, -105),
        new THREE.Vector3(0, 60, -80),
        new THREE.Vector3(0, 60, -55),
        new THREE.Vector3(0, 85, -30) // Até ao centro para ganhar
    ],
    green: [
        new THREE.Vector3(-155, 60, -30), // Quadrado inicial
        new THREE.Vector3(-130, 60, -30),
        new THREE.Vector3(-105, 60, -30),
        new THREE.Vector3(-80, 60, -30),
        new THREE.Vector3(-55, 60, -30),
        new THREE.Vector3(-55, 60, -55),
        new THREE.Vector3(-30, 60, -55),
        new THREE.Vector3(-30, 60, -80),
        new THREE.Vector3(-30, 60, -105),
        new THREE.Vector3(-30, 60, -130),
        new THREE.Vector3(-30, 60, -155),
        new THREE.Vector3(-30, 60, -180),
        new THREE.Vector3(0, 60, -180), // Lado verde até ao lado vermelho

        new THREE.Vector3(30, 60, -180),
        new THREE.Vector3(30, 60, -155),
        new THREE.Vector3(30, 60, -130),
        new THREE.Vector3(30, 60, -105),
        new THREE.Vector3(30, 60, -80),
        new THREE.Vector3(30, 60, -55),
        new THREE.Vector3(55, 60, -55),
        new THREE.Vector3(55, 60, -30),
        new THREE.Vector3(80, 60, -30),
        new THREE.Vector3(105, 60, -30),
        new THREE.Vector3(130, 60, -30),
        new THREE.Vector3(155, 60, -30),
        new THREE.Vector3(180, 60, -30),
        new THREE.Vector3(180, 60, 0), // Lado vermelho até ao lado amarelo

        new THREE.Vector3(180, 60, 30),
        new THREE.Vector3(155, 60, 30),
        new THREE.Vector3(130, 60, 30),
        new THREE.Vector3(105, 60, 30),
        new THREE.Vector3(80, 60, 30),
        new THREE.Vector3(55, 60, 30),
        new THREE.Vector3(55, 60, 55),
        new THREE.Vector3(30, 60, 55),
        new THREE.Vector3(30, 60, 80),
        new THREE.Vector3(30, 60, 105),
        new THREE.Vector3(30, 60, 130),
        new THREE.Vector3(30, 60, 155),
        new THREE.Vector3(30, 60, 180),
        new THREE.Vector3(0, 60, 180), // Lado amarelo até ao lado azul

        new THREE.Vector3(-30, 60, 180),
        new THREE.Vector3(-30, 60, 155),
        new THREE.Vector3(-30, 60, 130),
        new THREE.Vector3(-30, 60, 105),
        new THREE.Vector3(-30, 60, 80),
        new THREE.Vector3(-30, 60, 55),
        new THREE.Vector3(-55, 60, 55),
        new THREE.Vector3(-55, 60, 30),
        new THREE.Vector3(-80, 60, 30),
        new THREE.Vector3(-105, 60, 30),
        new THREE.Vector3(-130, 60, 30),
        new THREE.Vector3(-155, 60, 30),
        new THREE.Vector3(-180, 60, 30),
        new THREE.Vector3(-180, 60, 0), // Lado azul até ao lado verde

        new THREE.Vector3(-155, 60, 0),
        new THREE.Vector3(-130, 60, 0),
        new THREE.Vector3(-105, 60, 0),
        new THREE.Vector3(-80, 60, 0),
        new THREE.Vector3(-55, 60, 0),
        new THREE.Vector3(-30, 85, 0) // Até ao centro para ganhar
    ]
};

let currentPlayerIndex = 0;
const playerColors = ['yellow', 'blue', 'green', 'red'];
let turnTimeout;
let hasRolledDice = false; // Variável para controlar se o jogador já rolou o dado
const turnDuration = 180; // Duração do turno em segundos
let timeRemaining = turnDuration;
let timerInterval; // Variável para armazenar o intervalo do timer

// Adiciona o elemento HTML para o timer
const timerElement = document.createElement('div');
timerElement.id = 'timer';
timerElement.style.position = 'absolute';
timerElement.style.top = '10px';
timerElement.style.right = '10px';
timerElement.style.fontSize = '20px';
timerElement.style.color = 'white';
document.body.appendChild(timerElement);

function updateTimer() {
    timerElement.textContent =  'Tempo restante:' + timeRemaining;
}

function startTurn() {
    changeCameraPerspective(currentPlayerIndex + 1); // Ajusta a perspectiva da câmera

    // Inicia o temporizador de 60 segundos para o turno
    turnTimeout = setTimeout(() => {
        endTurn();
    }, 60000);

    // Atualiza o display para mostrar o jogador atual
    document.getElementById('currentPlayer').textContent = 'Turno do jogador: ' + playerColors[currentPlayerIndex];

    isDiceRolled = false; // Resetar o dado para o próximo jogador
    hasRolledDice = false; // Resetar o controle de rolagem do dado
}

function endTurn() {
    clearTimeout(turnTimeout); // Limpa o temporizador do turno atual
    currentPlayerIndex = (currentPlayerIndex + 1) % playerColors.length; // Muda para o próximo jogador
    isDiceRolled = false; // Resetar o dado para o próximo jogador
    hasRolledDice = false; // Resetar o controle de rolagem do dado
    startTurn(); // Inicia o próximo turno
}


function changeCameraPerspective(playerIndex) {
    const cameraTargetPositions = [
        { x: 230, y: 250, z: 280 }, // Perspectiva do jogador amarelo
        { x: -280, y: 250, z: 230 }, // Perspectiva do jogador azul
        { x: -280, y: 250, z: -240 }, // Perspectiva do jogador verde
        { x: 230, y: 250, z: -280 }, // Perspectiva do jogador vermelho
        { x:0 , y:400, z:0} //Perspetiva de cima
    ];

    const targetPosition = cameraTargetPositions[playerIndex - 1];

    gsap.to(camera.position, {
        duration: 2,
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        onUpdate: () => {
            camera.lookAt(0, 50, 0);
        }
    });
}

function onMouseClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([dice, diceBlue, diceRed, diceGreen, ...yellowPieces, ...bluePieces, ...redPieces, ...greenPieces], true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const currentColor = playerColors[currentPlayerIndex];

        if ((intersectedObject === dice || intersectedObject === diceBlue || intersectedObject === diceRed || intersectedObject === diceGreen) && !isDiceRolled && !hasRolledDice) {
            rollDice(result => {
                isDiceRolled = true; // Marcar que o dado foi rolado
                diceResult = result; // Armazenar o resultado do dado
                document.getElementById('result').textContent = "Número: " + result;

                if (allPiecesInBase(currentColor) && result !== 6) {
                    // Se todas as peças estão na base e o resultado não é 6, passa o turno
                    endTurn();
                } else if (result !== 6) {
                    hasRolledDice = true; // Marcar que o jogador já rolou o dado
                }
            });
        } else if (isDiceRolled) {
            const parent = intersectedObject.parent;
            if ((currentColor === 'yellow' && yellowPieces.includes(parent)) ||
                (currentColor === 'blue' && bluePieces.includes(parent)) ||
                (currentColor === 'red' && redPieces.includes(parent)) ||
                (currentColor === 'green' && greenPieces.includes(parent))) {

                // Verificar se a peça já ganhou
                if (parent.userData.hasWon) {
                    alert('Esta peça já chegou ao centro e não pode ser movida.');
                    return;
                }

                selectedPiece = parent;
                movePieceByDiceResult(selectedPiece, diceResult, currentColor);
            }
        }
    }
}

function allPiecesInBase(color) {
    const basePositions = {
        yellow: yellowPositions,
        blue: bluePositions,
        red: redPositions,
        green: greenPositions
    };

    const pieces = {
        yellow: yellowPieces,
        blue: bluePieces,
        red: redPieces,
        green: greenPieces
    };

    return pieces[color].every(piece => {
        const isInBase = basePositions[color].some(pos => pos.x === piece.position.x && pos.z === piece.position.z);
        const isInCenter = centralPositions.some(pos => pos.equals(piece.position));
        return isInBase || isInCenter;
    });
}

// Função para mostrar a face 6 do dado
function showSixFace() {
    const currentColor = playerColors[currentPlayerIndex];
    const currentDice = {
        yellow: dice,
        blue: diceBlue,
        red: diceRed,
        green: diceGreen
    }[currentColor];
            diceResult = 6; // Armazenar o resultado do dado como 6
            document.getElementById('result').textContent = "Número: 6";
            isDiceRolled = true; // Marcar que o dado foi rolado
            hasRolledDice = true; // Marcar que o jogador já rolou o dado
     
}

// Adiciona botão para forçar a face 6 do dado
const forceSixButton = document.createElement('button');
forceSixButton.id = 'forceSixButton';
forceSixButton.textContent = 'Forçar 6';
forceSixButton.style.position = 'absolute';
forceSixButton.style.bottom = '10px';
forceSixButton.style.left = '10px';
document.body.appendChild(forceSixButton);

forceSixButton.addEventListener('click', showSixFace);
function rollDice(callback) {
    const randomX = Math.floor(Math.random() * 20 + 10) * (Math.PI / 2);
    const randomY = Math.floor(Math.random() * 20 + 10) * (Math.PI / 2);
    const randomZ = Math.floor(Math.random() * 20 + 10) * (Math.PI / 2);

    const currentColor = playerColors[currentPlayerIndex];
    const currentDice = {
        yellow: dice,
        blue: diceBlue,
        red: diceRed,
        green: diceGreen
    }[currentColor];

    gsap.to(currentDice.rotation, {
        duration: 2,
        x: randomX,
        y: randomY,
        z: randomZ,
        ease: "power4.out",
        onComplete: function() {
            const topFaceIndex = calculateTopFace(currentDice);
            const topFaceTexture = diceTextures[topFaceIndex];
            let result;
            
            // Verificando a textura da face superior para determinar o número
            switch(topFaceTexture) {
                case 'dado1.jpg':
                    result = 1;
                    break;
                case 'dado2.jpg':
                    result = 2;
                    break;
                case 'dado3.jpg':
                    result = 3;
                    break;
                case 'dado4.jpg':
                    result = 4;
                    break;
                case 'dado5.jpg':
                    result = 5;
                    break;
                case 'dado6.jpg':
                    result = 6;
                    break;
                default:
                    result = 0; // Valor padrão caso algo dê errado
            }

            diceResult = result; // Armazenar o resultado do dado
            document.getElementById('result').textContent = "Número: " + result;
            callback(result);
        }
    });
}

// Funções auxiliares e iniciais
function isWhiteSquare(position) {
    const whiteSquareColors = [0xFFFFFF]; // Array de cores de quadrados brancos, adicione mais cores se necessário
    const squares = scene.children.filter(child => child instanceof THREE.Mesh && whiteSquareColors.includes(child.material.color.getHex()));
    return squares.some(square => {
        const distance = square.position.distanceTo(position);
        return distance < 5; // Ajuste essa distância conforme necessário
    });
}

// Defina as posições centrais
const centralPositions = [
    new THREE.Vector3(30, 85, 0),
    new THREE.Vector3(0, 85, 30),
    new THREE.Vector3(0, 85, -30),
    new THREE.Vector3(-30, 85, 0)
];

function movePieceByDiceResult(piece, steps, color) {
    const isPieceInBase = (piece) => {
        const basePositions = {
            yellow: yellowPositions,
            blue: bluePositions,
            red: redPositions,
            green: greenPositions
        };

        const positions = basePositions[color];
        return positions.some(pos => pos.x === piece.position.x && pos.z === piece.position.z);
    };

    if (isPieceInBase(piece) && steps === 6) {
        const startPosition = paths[color][0];
        piece.position.set(startPosition.x, startPosition.y, startPosition.z);
        piece.userData.currentPositionIndex = 0;
        isDiceRolled = false;
        hasRolledDice = false;
        return;
    } else if (isPieceInBase(piece) && steps !== 6) {
        alert('Você só pode mover uma peça para fora da base se o dado resultar em 6.');
        return;
    }

    // Verificar se a peça já atingiu o centro
    if (centralPositions.some(pos => pos.equals(piece.position))) {
        alert('Esta peça já atingiu o centro e não pode ser movida.');
        return;
    }

    let stepIndex = 0;
    const path = paths[color];
    const currentIndex = piece.userData.currentPositionIndex;

    if (currentIndex + steps >= path.length) {
        alert('Você precisa obter o número exato para alcançar o centro.');
        return;
    }

    function moveToNextSquare() {
        if (stepIndex < steps) {
            const targetIndex = (currentIndex + stepIndex + 1) % path.length;
            const targetPosition = path[targetIndex];
            const startPosition = piece.position.clone();
            const jumpHeight = 30;
            const duration = 500;
            const startTime = performance.now();

            function animateJump(time) {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);

                piece.position.lerpVectors(startPosition, targetPosition, progress);

                const yOffset = jumpHeight * Math.sin(Math.PI * progress);
                piece.position.y += yOffset;

                piece.rotation.y = Math.PI * 2 * progress;

                if (progress < 1) {
                    requestAnimationFrame(animateJump);
                } else {
                    stepIndex++;
                    moveToNextSquare();
                }
            }

            requestAnimationFrame(animateJump);
        } else {
            piece.userData.currentPositionIndex = (currentIndex + steps) % path.length;
            checkForCollision(piece, color);

            // Verificar se a peça chegou ao centro
            if (centralPositions.some(pos => pos.equals(piece.position))) {
                piece.userData.hasWon = true; // Marcar a peça como vencedora
                disassemblePiece(piece);

            }

            const allPieces = {
                yellow: yellowPieces,
                blue: bluePieces,
                red: redPieces,
                green: greenPieces
            }[color];

            const allWon = allPieces.every(piece => piece.userData.hasWon);
            if (allWon) {
                showWinnerGIF();
            }

            if (steps !== 6) {
                isDiceRolled = false;
                setTimeout(() => document.getElementById('endTurnButton').style.display = 'block', 500);
            } else {
                isDiceRolled = false;
                hasRolledDice = false;
            }
        }
    }

    moveToNextSquare();
}

function showCollisionGIF(callback) {
    const gifUrl = 'among-us-mungus.gif'; // Substitua pelo caminho do seu GIF
    const gifElement = document.createElement('img');
    gifElement.src = gifUrl;
    gifElement.style.position = 'absolute';
    gifElement.style.top = '50%';
    gifElement.style.left = '50%';
    gifElement.style.transform = 'translate(-50%, -50%)';
    gifElement.style.zIndex = '1000';
    gifElement.style.width = '50%'; // Ajustar conforme necessário
    gifElement.style.height = '50%'; // Ajustar conforme necessário
    document.body.appendChild(gifElement);

    setTimeout(() => {
        document.body.removeChild(gifElement);
        callback(); // Chama a função de callback após exibir o GIF
    }, 2000); // Exibir o GIF por 2 segundos (ajuste conforme necessário)
}


function checkForCollision(movedPiece, color) {
    const otherColors = playerColors.filter(c => c !== color);

    otherColors.forEach(otherColor => {
        const otherPieces = {
            yellow: yellowPieces,
            blue: bluePieces,
            red: redPieces,
            green: greenPieces
        }[otherColor];

        otherPieces.forEach(piece => {
            if (movedPiece.position.x === piece.position.x && movedPiece.position.z === piece.position.z) {
                showCollisionGIF(() => {
                    moveToBase(piece, otherColor);
                });
            }
        });
    });
}

function moveToBase(piece, color) {
    const basePositions = {
        yellow: yellowPositions,
        blue: bluePositions,
        red: redPositions,
        green: greenPositions
    };

    const positions = basePositions[color];
    for (const pos of positions) {
        if (!isOccupied(pos, color)) {
            piece.position.set(pos.x, pos.y, pos.z);
            piece.userData.currentPositionIndex = 0;
            break;
        }
    }
}

function isOccupied(position, color) {
    const pieces = {
        yellow: yellowPieces,
        blue: bluePieces,
        red: redPieces,
        green: greenPieces
    };

    return pieces[color].some(piece => {
        return piece.position.x === position.x && piece.position.z === position.z;
    });
}


function onMouseClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([dice, diceBlue, diceRed, diceGreen, ...yellowPieces, ...bluePieces, ...redPieces, ...greenPieces], true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        const currentColor = playerColors[currentPlayerIndex];

        if ((intersectedObject === dice || intersectedObject === diceBlue || intersectedObject === diceRed || intersectedObject === diceGreen) && !isDiceRolled && !hasRolledDice) {
            rollDice(result => {
                isDiceRolled = true; // Marcar que o dado foi rolado
                diceResult = result; // Armazenar o resultado do dado
                document.getElementById('result').textContent = "Número: " + result;

                if (allPiecesInBase(currentColor) && result !== 6) {
                    // Se todas as peças estão na base e o resultado não é 6, passa o turno
                    endTurn();
                } else if (result !== 6) {
                    hasRolledDice = true; // Marcar que o jogador já rolou o dado
                }
            });
        } else if (isDiceRolled) {
            const parent = intersectedObject.parent;
            if ((currentColor === 'yellow' && yellowPieces.includes(parent)) ||
                (currentColor === 'blue' && bluePieces.includes(parent)) ||
                (currentColor === 'red' && redPieces.includes(parent)) ||
                (currentColor === 'green' && greenPieces.includes(parent))) {
                selectedPiece = parent;
                movePieceByDiceResult(selectedPiece, diceResult, currentColor);
            }
        }
    }
}



// Inicializa o jogo
startTurn();

window.addEventListener('click', onMouseClick, false);

let previousCameraPosition = null;

window.addEventListener('keydown', (event) => {
    if (event.key >= '1' && event.key <= '5') {
        if (event.key === '5' && previousCameraPosition === null) {
            saveCurrentCameraPosition();
        }
        changeCameraPerspective(Number(event.key));
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key === '5') {
        restorePreviousCameraPerspective();
    }
});

function saveCurrentCameraPosition() {
    previousCameraPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };
}

function restorePreviousCameraPerspective() {
    if (previousCameraPosition) {
        gsap.to(camera.position, {
            duration: 2,
            x: previousCameraPosition.x,
            y: previousCameraPosition.y,
            z: previousCameraPosition.z,
            onUpdate: () => {
                camera.lookAt(0, 50, 0);
            },
            onComplete: () => {
                previousCameraPosition = null; // Reset depois do restauro
            }
        });
    }
}


// Ajustar o canvas depois da janela ser resized
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Setup para o dado
const diceTextures = [
    'dado1.jpg',
    'dado2.jpg',
    'dado3.jpg',
    'dado4.jpg',
    'dado5.jpg',
    'dado6.jpg'
];

const diceMaterials = diceTextures.map(texture => {
    const loader = new THREE.TextureLoader();
    return new THREE.MeshStandardMaterial({ map: loader.load(texture) });
});

const diceGeometry = new THREE.BoxGeometry(50, 50, 50);
const dice = new THREE.Mesh(diceGeometry, diceMaterials);
dice.position.set(250, 75, 100);
dice.castShadow = true;
        dice.receiveShadow = true;
scene.add(dice);

const diceBlue = new THREE.Mesh(diceGeometry.clone(), diceMaterials);
diceBlue.position.set(-100, 75, 250);
dice.castShadow = true;
        dice.receiveShadow = true;
scene.add(diceBlue);

const diceRed = new THREE.Mesh(diceGeometry.clone(), diceMaterials);
diceRed.position.set(100, 75, -250);
dice.castShadow = true;
        dice.receiveShadow = true;
scene.add(diceRed);

const diceGreen = new THREE.Mesh(diceGeometry.clone(), diceMaterials);
diceGreen.position.set(-250, 75, -100);
dice.castShadow = true;
        dice.receiveShadow = true;
scene.add(diceGreen);

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

renderer.domElement.addEventListener('mousedown', event => {
    isDragging = true;
});

renderer.domElement.addEventListener('mouseup', event => {
    isDragging = false;
});

renderer.domElement.addEventListener('mousemove', event => {
    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    if (isDragging) {
        const deltaRotationQuaternion = new THREE.Quaternion()
            .setFromEuler(new THREE.Euler(
                toRadians(deltaMove.y * 1),
                toRadians(deltaMove.x * 1),
                0,
                'XYZ'
            ));
        dice.quaternion.multiplyQuaternions(deltaRotationQuaternion, dice.quaternion);
        diceBlue.quaternion.multiplyQuaternions(deltaRotationQuaternion, diceBlue.quaternion);
        diceRed.quaternion.multiplyQuaternions(deltaRotationQuaternion, diceRed.quaternion);
        diceGreen.quaternion.multiplyQuaternions(deltaRotationQuaternion, diceGreen.quaternion);
    }

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function calculateTopFace(dice) {
    const directionVectors = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, -1)
    ];

    let closestFaceIndex = -1;
    let maxDot = -Infinity;

    for (let i = 0; i < directionVectors.length; i++) {
        const direction = directionVectors[i].clone().applyQuaternion(dice.quaternion);
        const dot = direction.dot(new THREE.Vector3(0, 1, 0)); // Alinhado com o eixo Y positivo

        if (dot > maxDot) {
            maxDot = dot;
            closestFaceIndex = i;
        }
    }

    return closestFaceIndex;
}

function onDiceClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([dice, diceBlue, diceRed, diceGreen], true);
    if (intersects.length > 0) {
        const intersectedDice = intersects[0].object;
        if (!hasRolledDice) {
            rollDice(result => {
                document.getElementById('result').textContent = "Número: " + result;
            });
        }
    }
}

renderer.domElement.addEventListener('click', onDiceClick);

function resetPieces() {
    // Remover as peças todas da scene
    yellowPieces.forEach(piece => scene.remove(piece));
    bluePieces.forEach(piece => scene.remove(piece));
    redPieces.forEach(piece => scene.remove(piece));
    greenPieces.forEach(piece => scene.remove(piece));

    // Limpar arrays
    yellowPieces.length = 0;
    bluePieces.length = 0;
    redPieces.length = 0;
    greenPieces.length = 0;

    // Criar novas peças amarelas
    yellowPositions.forEach(pos => {
        const piece = createYellowLudoPiece();
        piece.position.set(pos.x, pos.y, pos.z);
        piece.scale.set(1.2, 1.2, 1.2);
        piece.userData = { currentPositionIndex: 0 }; // Adicionar userData para cada peça
        scene.add(piece);
        yellowPieces.push(piece);
    });

    // Criar novas peças azul
    bluePositions.forEach(pos => {
        const piece = create4BlueLudoPiece();
        piece.position.set(pos.x, pos.y, pos.z);
        piece.scale.set(1.2, 1.2, 1.2); 
        piece.userData = { currentPositionIndex: 0 }; // Adicionar userData para cada peça
        scene.add(piece);
        bluePieces.push(piece);
    });

    // Criar novas peças vermelhas
    redPositions.forEach(pos => {
        const piece = create4RedLudoPiece();
        piece.position.set(pos.x, pos.y, pos.z);
        piece.scale.set(1.2, 1.2, 1.2); // Uniform scaling
        piece.userData = { currentPositionIndex: 0 }; // Adicionar userData para cada peça
        scene.add(piece);
        redPieces.push(piece);
    });

    // Criar novas peças verdes
    greenPositions.forEach(pos => {
        const piece = create4GreenLudoPiece();
        piece.position.set(pos.x, pos.y, pos.z);
        piece.scale.set(1.2, 1.2, 1.2); // Uniform scaling
        piece.userData = { currentPositionIndex: 0 }; // Adicionar userData para cada peça
        scene.add(piece);
        greenPieces.push(piece);
    });
}

// Função para mostrar o GIF do vencedor
function showWinnerGIF() {
    const gifUrl = 'winner.gif'; 
    const gifElement = document.createElement('img');
    gifElement.src = gifUrl;
    gifElement.style.position = 'absolute';
    gifElement.style.top = '50%';
    gifElement.style.left = '50%';
    gifElement.style.transform = 'translate(-50%, -50%)';
    gifElement.style.zIndex = '1000';
    gifElement.style.width = '50%'; // Ajustar conforme necessário
    gifElement.style.height = '50%'; // Ajustar conforme necessário
    document.body.appendChild(gifElement);

    setTimeout(() => {
        document.body.removeChild(gifElement);
        resetPieces(); // Resetar as peças após exibir o GIF
        newGame(); // Iniciar um novo jogo após exibir o GIF
    }, 5000); // Exibir o GIF por 5 segundos
}

function disassemblePiece(piece) {
    const pieces = [];
    piece.traverse(child => {
        if (child instanceof THREE.Mesh) {
            pieces.push(child);
        }
    });

    pieces.forEach((part, index) => {
        const originalPosition = part.position.clone();
        gsap.to(part.position, {
            duration: 2,
            x: originalPosition.x + (Math.random() - 0.5) * 200,
            y: originalPosition.y + (Math.random() - 0.5) * 200,
            z: originalPosition.z + (Math.random() - 0.5) * 200,
            ease: "power4.out"
        });

        gsap.to(part.rotation, {
            duration: 2,
            x: Math.random() * Math.PI * 2,
            y: Math.random() * Math.PI * 2,
            z: Math.random() * Math.PI * 2,
            ease: "power4.out"
        });

        gsap.to(part.scale, {
            duration: 2,
            x: 0,
            y: 0,
            z: 0,
            ease: "power4.out",
            onComplete: () => {
                piece.remove(part);
                if (index === pieces.length - 1) {
                    scene.remove(piece);
                }
            }
        });
    });
}


// Renderizar o loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Adiciona botão para finalizar a jogada
const endTurnButton = document.createElement('button');
endTurnButton.id = 'endTurnButton';
endTurnButton.textContent = 'Terminei minha jogada';
endTurnButton.style.position = 'absolute';
endTurnButton.style.bottom = '10px';
endTurnButton.style.right = '10px';
endTurnButton.style.display = 'none';
document.body.appendChild(endTurnButton);
    
endTurnButton.addEventListener('click', () => {
    endTurnButton.style.display = 'none';
    endTurn();
});

    


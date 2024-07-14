//ATAKAN KAPLAN - 191180768
//FATMA NUR KORKMAZ - 191180058

// Temel değişkenler
let scene,
  camera,
  renderer,
  ferrisWheelGroup,
  rollerCoasterGroup,
  train,
  trainPosition,
  sun,
  sunMesh,
  tree,
  ground;

let rotationSpeed = 0.0001;
let rotationDirection = 1;

let container = document.getElementById("container");
let cabins = []; // Kabinlerin referanslarını saklamak için dizi

let carouselGroup; // Carousel'un ana grup objesi
let carouselPole; // Carousel'un orta direği
let carouselRadius = 5; // Carousel çemberinin yarıçapı
let carouselRotationSpeed = 0.01; // Carousel'ın dönüş hızı
let carouselMoveDirection = 1; // Carousel'ın hareket yönü - yukarı aşağı için

let poolGroup; // Havuz grubu

// Arabalar
let cars = []; // Arabaların referanslarını saklamak için dizi
let carSpeed = 0.025; // Araba hızı

// Three.js sahnesini başlat
async function init() {
  // Sahne oluştur
  scene = new THREE.Scene();

  // Kamera oluştur
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 7, 30);
  // camera.lookAt(0, 0, 0); // Kamera yandan gösterebilir

  // Renderer oluştur ve sayfaya ekle
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Texture yükleyici oluştur
  const textureLoader = new THREE.TextureLoader();

  // Zemin için dokuyu yükle
  const groundTexture = textureLoader.load("GroundGrassGreen002_COL_3K.jpg");
  groundTexture.wrapS = THREE.RepeatWrapping;
  groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(10, 10);

  // Zemin oluştur ve sahneye ekle
  const groundGeometry = new THREE.PlaneGeometry(150, 150);
  const groundMaterial = new THREE.MeshLambertMaterial({
    map: groundTexture,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = Math.PI / 2;
  scene.add(ground);

  // Gökyüzü için dokuyu yükle
  const skyTexture = textureLoader.load("HdrSkyOvercast001_preview1.jpg");
  const skyGeometry = new THREE.SphereGeometry(100, 32, 32);
  const skyMaterial = new THREE.MeshBasicMaterial({
    map: skyTexture,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  // Dönme dolabı ve direğini oluştur ve sahneye ekle
  createFerrisWheel();

  // Roller coaster'ı oluştur ve sahneye ekle
  createRollerCoaster();

  // Carousel'ı oluştur ve sahneye ekle
  createCarousel();

  // Havuzu oluştur
  createPool();

  // Ağaçları oluştur
  createTree();

  // Arabaları oluşturur
  createCars();

  // Güneş ışığı ve modelini ekle
  sun = new THREE.PointLight(0xffffff, 30, 150); // Güneş ışığı
  sun.position.set(10, 25, -15);
  scene.add(sun);
  const sunTexture = textureLoader.load("TCom_Metal_RedHotSteel_header.jpg");
  const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    side: THREE.BackSide,
  });
  sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  sunMesh.position.copy(sun.position);
  scene.add(sunMesh);

  // Dönme Dolap için Kullanıcı kontrollerini ekle
  document
    .getElementById("rotationSpeed")
    .addEventListener("input", (event) => {
      rotationSpeed = parseFloat(event.target.value);

      // Dönüş hızı göstergesini güncelle
      /* document.getElementById(
        "rotationSpeedDisplay"
      ).innerText = `Dönüş Hızı: ${rotationSpeed.toFixed(3) * 1000} m/s`;*/
    });
  document
    .getElementById("rotationDirection")
    .addEventListener("change", (event) => {
      rotationDirection = parseInt(event.target.value);
    });
  // Carousel için Kullanıcı kontrollerini ekle
  document
    .getElementById("carouselRotationSpeed")
    .addEventListener("input", (event) => {
      carouselRotationSpeed = parseFloat(event.target.value);
    });

  // Güneş için Kullanıcı kontrollerini ekle
  document.getElementById("sunIntensity").addEventListener("input", (event) => {
    sun.intensity = parseFloat(event.target.value);
  });

  const moveSpeed = 0.5;
  document.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "8":
        camera.position.z -= moveSpeed;
        break;
      case "2":
        camera.position.z += moveSpeed;
        break;
      case "4":
        camera.position.x -= moveSpeed;
        break;
      case "6":
        camera.position.x += moveSpeed;
        break;
      case "+":
        camera.position.y += moveSpeed;
        break;
      case "-":
        camera.position.y -= moveSpeed;
        break;
      case "ArrowUp":
        trainPosition -= 0.01;
        break;
      case "ArrowDown":
        trainPosition += 0.01;
        break;
      case "a":
        sun.position.x -= moveSpeed; // Z tuşu ile sola hareketif
        break;
      case "d":
        sun.position.x += moveSpeed; // C tuşu ile sağa hareket
        break;
      case "w":
        sun.position.y += moveSpeed; // X tuşu ile yukarı hareket
        break;
      case "s":
        sun.position.y -= moveSpeed; // V tuşu ile aşağı hareket
        break;
      case "z":
        sun.position.z += moveSpeed; // V tuşu ile aşağı hareket
        break;
      case "x":
        sun.position.z -= moveSpeed; // V tuşu ile aşağı hareket
        break;
      case " ":
        // Space tuşuna basıldığında Carousel yukarı ya da aşağı hareket etsin
        if (carouselMoveDirection === 1) {
          carouselGroup.position.y = -3;
        } else {
          carouselGroup.position.y = 4.5;
        }
        carouselMoveDirection *= -1; // Hareket yönünü tersine çevir

        break;
    }
  });

  // Pencere boyutlandırma olayını dinle
  window.addEventListener("resize", onWindowResize, false);

  // Animasyon döngüsünü başlat
  animate();
}

// Dönme dolabı oluşturma fonksiyonu
function createFerrisWheel() {
  // Dönme dolabı grubunu oluştur
  ferrisWheelGroup = new THREE.Group();

  // Kabinlerin oluşturulması
  const cabinGeometry = new THREE.BoxGeometry(0.7, 0.4, 0.5);
  const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  const radius = 5; // Dönme dolabının yarıçapı

  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(x, y, 0); // Kabinleri doğru pozisyona yerleştir
    ferrisWheelGroup.add(cabin);

    // Kabinlerin başlangıç rotasyonunu kaydet
    cabin.startRotation = cabin.rotation.z;

    // Salınım hareketi için parametreler
    cabin.swingAngle = Math.PI / 8; // Maksimum salınım açısı
    cabin.rotationSpeed = 0.002; // Salınım hızı

    cabins.push(cabin); // Kabinleri diziye ekle
  }

  // Dönme dolabı çemberini oluştur
  const ferrisWheelGeometry = new THREE.TorusGeometry(5, 0.2, 16, 100);
  const ferrisWheelMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const ferrisWheel = new THREE.Mesh(ferrisWheelGeometry, ferrisWheelMaterial);
  ferrisWheel.rotation.z = Math.PI / 2;
  ferrisWheelGroup.add(ferrisWheel);

  const ferrisWheelGeometry2 = new THREE.RingGeometry(0.1, 5, 32);
  const ferrisWheelMaterial2 = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const ferrisWheel2 = new THREE.Mesh(
    ferrisWheelGeometry2,
    ferrisWheelMaterial2
  );
  ferrisWheel2.rotation.z = Math.PI / 2;
  ferrisWheel2.position.z = 0; // 3D efekt için ikinci çember
  ferrisWheelGroup.add(ferrisWheel2);

  // direk için dokuyu yükle
  const textureLoader = new THREE.TextureLoader();
  const texturePole = textureLoader.load("rusty_metal_sheet_diff_4k.jpg");
  // Direk oluştur ve sahneye ekle
  const poleGeometry = new THREE.CylinderGeometry(0.125, 0.25, 10.2, 32);
  const poleMaterial = new THREE.MeshStandardMaterial({ map: texturePole });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(-15, 2, -4.7);
  scene.add(pole);

  // Dönme dolabını sahneye ekle
  ferrisWheelGroup.position.set(-15, 7, -5);
  scene.add(ferrisWheelGroup);
}

// Kabinler için animasyonları hesapla ve güncelle
function animateCabins() {
  cabins.forEach((cabin) => {
    // Her kabin için salınım açısı hesapla
    const angle = Math.sin(Date.now() * cabin.rotationSpeed) * cabin.swingAngle;
    cabin.rotation.z = cabin.startRotation + angle;
  });
}

// Roller coaster oluşturma fonksiyonu
function createRollerCoaster() {
  // Roller coaster grubunu oluştur
  rollerCoasterGroup = new THREE.Group();

  // Roller coaster raylarını oluştur
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(-2, 5, 0),
    new THREE.Vector3(0, 4, 0),
    new THREE.Vector3(2, 3, 0),
    new THREE.Vector3(5, 2, 0),
    new THREE.Vector3(2, -2, 0),
    new THREE.Vector3(0, -2, 0),
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(-5, 0, 0),
  ]);
  const points = curve.getPoints(100);
  // Yol için BoxGeometry oluştur
  const railWidth = 1; // Yol genişliği
  const railHeight = 0.5; // Yol yüksekliği
  const railDepth = 0.5; // Yol derinliği

  const railGeometry = new THREE.BoxGeometry(railWidth, railHeight, railDepth);

  const railMaterial = new THREE.MeshLambertMaterial({
    color: 0x964b00,
    wireframe: true,
  });

  for (let i = 0; i < points.length - 1; i++) {
    // İki nokta arasındaki mesafeyi ve rotasyonu hesapla
    const start = points[i];
    const end = points[i + 1];
    const distance = start.distanceTo(end);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    // Yol segmentini oluştur ve pozisyonunu ayarla
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.position.copy(start);

    rail.rotation.z = angle;
    rail.translateX(distance / 2); // Yol segmentini iki nokta arasında ortala

    // Yolu ekle
    rollerCoasterGroup.add(rail);
  }

  // Treni oluştur
  const trainGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const trainMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  train = new THREE.Mesh(trainGeometry, trainMaterial);
  trainPosition = 0;
  rollerCoasterGroup.add(train);
  const textureLoader = new THREE.TextureLoader();

  // direk için dokuyu yükle
  const texturePole = textureLoader.load("rusty_metal_sheet_diff_4k.jpg");
  // Direkler oluştur ve sahneye ekle
  const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 32);
  const poleMaterial = new THREE.MeshLambertMaterial({ map: texturePole });
  for (let i = 0; i < points.length; i += 10) {
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(points[i].x, points[i].y - 5, points[i].z); // Direklerin pozisyonlarını ayarla
    rollerCoasterGroup.add(pole);
  }

  // Roller coaster grubunu sahneye ekle
  rollerCoasterGroup.position.set(15, 5, 5);
  scene.add(rollerCoasterGroup);
}

// Carousel'ı oluştur
function createCarousel() {
  carouselGroup = new THREE.Group();
  carouselGroup.position.set(0, 0, 10);
  scene.add(carouselGroup);

  const textureLoader = new THREE.TextureLoader();

  // Direk için dokuyu yükle
  const texturePole = textureLoader.load("rusty_metal_sheet_diff_4k.jpg");

  // Carousel'ın merkez direğini oluştur
  carouselPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 2, 18, 32),
    new THREE.MeshLambertMaterial({
      map: texturePole,
    })
  );
  carouselPole.position.z = 10;
  scene.add(carouselPole);

  // Carousel'ın çemberini oluştur
  const geometry = new THREE.TorusGeometry(5, 0.2, 16, 100);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    wireframe: false,
  });
  const circle = new THREE.Mesh(geometry, material);
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = 4; // Direğin yüksekliğini hesaba katarak ayarla
  carouselGroup.add(circle);

  const geometry2 = new THREE.RingGeometry(0.25, 5, 16); // İkinci çemberin yarıçapı ve diğerleri, Carousel iç demir
  const material2 = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    wireframe: true,
  });
  const circle2 = new THREE.Mesh(geometry2, material2);
  circle2.rotation.x = -Math.PI / 2;
  circle2.position.y = 3.8; // Carousel çemberinin yüksekliğini hesaba katarak ayarla
  carouselGroup.add(circle2);

  const geometry3 = new THREE.RingGeometry(0.25, 5, 16); // İkinci çemberin yarıçapı ve diğerleri, Carousel iç demir
  const material3 = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    wireframe: true,
  });
  const circle3 = new THREE.Mesh(geometry3, material3);
  circle3.rotation.x = -Math.PI / 2;
  circle3.position.y = 4.2; // Carousel çemberinin yüksekliğini hesaba katarak ayarla
  carouselGroup.add(circle3);

  // Direk için dokuyu yükle
  const textureSeat = textureLoader.load("fabric_pattern_07_col_1_4k.jpg");

  // Carousel koltukları oluştur
  const numSeats = 8;
  const seatRadius = 5; // Koltukların dönme yarıçapı
  const seatGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.4);
  const seatMaterial = new THREE.MeshLambertMaterial({ map: textureSeat });

  for (let i = 0; i < numSeats; i++) {
    const angle = (Math.PI * 2 * i) / numSeats;
    const x = seatRadius * Math.sin(angle);
    const z = seatRadius * Math.cos(angle);

    const seat = new THREE.Group();

    // Oturma yeri
    const seatBase = new THREE.Mesh(seatGeometry, seatMaterial);
    seatBase.position.y = 0.1;

    // Arkalık
    const backrestGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.1);
    const backrestMaterial = new THREE.MeshLambertMaterial({
      map: textureSeat,
    });
    const backrest = new THREE.Mesh(backrestGeometry, backrestMaterial);
    backrest.position.y = 0.25;
    backrest.position.z = -0.275;

    seat.add(seatBase);
    seat.add(backrest);

    seat.position.set(x, 4, z);
    seat.rotation.y = angle;
    carouselGroup.add(seat);
  }
}

function createPool() {
  // Havuz grubunu oluştur
  const poolGroup = new THREE.Group();

  // Lathe geometrisi ve malzemesini oluştur
  const points = [];
  for (let i = 0; i > -5; i--) {
    points.push(new THREE.Vector2(Math.sin(i * 0.02) * 1 + 5, (i - 5) * 0.5));
  }
  const poolGeometry = new THREE.LatheGeometry(points, 30);
  const poolMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const lathe = new THREE.Mesh(poolGeometry, poolMaterial);
  lathe.position.set(-15, 4, 15);
  poolGroup.add(lathe);

  // İkinci lathe geometrisi ve malzemesini oluştur
  const points2 = [];
  for (let i = 0; i < 5; i++) {
    points2.push(new THREE.Vector2(Math.sin(i * 0.02) * 1 + 5, (i - 5) * 0.5));
  }
  const poolGeometry2 = new THREE.LatheGeometry(points2, 30);
  const poolMaterial2 = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const lathe2 = new THREE.Mesh(poolGeometry2, poolMaterial2);
  lathe2.position.set(-15, 2, 15);
  poolGroup.add(lathe2);

  // Havuzun üzerindeki top
  const poolTopGeometry = new THREE.SphereGeometry(1.3, 32, 16);
  const poolTopMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const poolTop = new THREE.Mesh(poolTopGeometry, poolTopMaterial);
  poolTop.position.set(-13, 0.5, 12);
  poolGroup.add(poolTop);

  // Texture yükleyici oluştur
  const textureLoader = new THREE.TextureLoader();

  // Su dokulu texture yükle
  const waterTexture = textureLoader.load("water.jpg");

  // Daire geometrisini oluştur
  const poolGeometry3 = new THREE.CircleGeometry(5, 32);

  // Su dokulu malzemesini oluştur
  const poolMaterial3 = new THREE.MeshStandardMaterial({
    map: waterTexture, // Su dokulu texture'ı malzemeye ekle
    side: THREE.DoubleSide, // Düzlemin her iki tarafına da texture'ı uygula
    transparent: false, // Malzemeyi saydam yap
    opacity: 1, // Saydamlık değeri (isteğe bağlı)
  });

  // Mesh oluştur ve sahneye ekle
  const poolCircle = new THREE.Mesh(poolGeometry3, poolMaterial3);
  poolCircle.position.set(-15, 0.1, 15);
  poolCircle.rotation.x = -Math.PI / 2;
  poolGroup.add(poolCircle);

  // Sahneye havuz grubunu ekle
  scene.add(poolGroup);
}

function createTree() {
  // Three.js ile ağaçlar oluşturma

  // Standart malzeme tanımları
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b4513, // Kahverengi
    roughness: 1, // Yüzey pürüzlülüğü
    metalness: 0, // Metaliklik
  });

  const leavesMaterial1 = new THREE.MeshStandardMaterial({
    color: 0x228b22, // Yeşil
    roughness: 0.5, // Yüzey pürüzlülüğü
    metalness: 0, // Metaliklik
  });

  const leavesMaterial2 = new THREE.MeshStandardMaterial({
    color: 0x008000, // Koyu yeşil
    roughness: 0.7, // Yüzey pürüzlülüğü
    metalness: 0, // Metaliklik
  });

  const leavesMaterial3 = new THREE.MeshStandardMaterial({
    color: 0x32cd32, // Orta yeşil
    roughness: 0.3, // Yüzey pürüzlülüğü
    metalness: 0, // Metaliklik
  });

  // Ağaçları oluşturacak fonksiyon
  function createTree(position) {
    // Gövdeyi oluştur
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 32);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    // Yaprakları oluştur
    const leavesGeometry = new THREE.ConeGeometry(2.5, 5, 32);

    // Rastgele yaprak malzemesi seçimi
    const materials = [leavesMaterial1, leavesMaterial2, leavesMaterial3];
    const leavesMaterial =
      materials[Math.floor(Math.random() * materials.length)];

    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);

    // Yaprakları gövdenin üstüne yerleştir
    leaves.position.y = 5;

    // Gövde ve yaprakları tek bir grupta birleştir
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);

    // Ağacın sahnedeki konumunu ayarla
    tree.position.copy(position);

    // Sahneye ağacı ekle
    scene.add(tree);
  }

  // Örnek olarak 4 farklı konumda ağaç oluştur
  createTree(new THREE.Vector3(-10, 0, -15));
  createTree(new THREE.Vector3(15, 0, -10));
  createTree(new THREE.Vector3(-20, 0, 10));
  createTree(new THREE.Vector3(20, 0, 15));
}

// Arabaları oluştur
function createCars() {
  const carGeometry = new THREE.BoxGeometry(2, 0.7, 1.5);
  const carMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });

  // Arabaların pozisyonlarını belirleyecek noktalar
  const points = [
    new THREE.Vector3(15, 1.2, -13),
    new THREE.Vector3(14, 0.5, -13),
    new THREE.Vector3(15, 0.5, -13),

    new THREE.Vector3(11, 1.2, -13),
    new THREE.Vector3(10, 0.5, -13),
    new THREE.Vector3(11, 0.5, -13),

    new THREE.Vector3(7, 1.2, -13),
    new THREE.Vector3(6, 0.5, -13),
    new THREE.Vector3(7, 0.5, -13),

    new THREE.Vector3(3, 1.2, -13),
    new THREE.Vector3(2, 0.5, -13),
    new THREE.Vector3(3, 0.5, -13),

    new THREE.Vector3(-0.6, 1.2, -13),
    new THREE.Vector3(-2, 0.5, -13),
    new THREE.Vector3(-0.6, 0.5, -13),
  ];

  // Her nokta için bir araba oluştur
  points.forEach((point) => {
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.copy(point);
    cars.push(car);
    scene.add(car);
  });
}

// Arabaları hareket ettir
function animateCars() {
  cars.forEach((car) => {
    car.position.x -= carSpeed;
    // Eğer araba sahneden çıkarsa tekrar başa al
    if (car.position.x < -50) {
      car.position.x = 50;
    }
  });
}

// Pencere yeniden boyutlandırıldığında renderer'ı güncelle
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animasyon döngüsü
function animate() {
  requestAnimationFrame(animate);

  // Güneş ışığının pozisyonunu güncelle
  sunMesh.position.copy(sun.position);

  // Dönme dolabını döndür
  ferrisWheelGroup.rotation.z += rotationDirection * rotationSpeed;

  // Kabinleri animasyonla hareket ettir
  animateCabins();

  animateCars();

  // Tren pozisyonunu güncelle
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(-2, 5, 0),
    new THREE.Vector3(0, 4, 0),
    new THREE.Vector3(2, 3, 0),
    new THREE.Vector3(5, 2, 0),
    new THREE.Vector3(2, -2, 0),
    new THREE.Vector3(0, -2, 0),
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(-5, 0, 0),
  ]);
  const point = curve.getPointAt(((trainPosition % 1) + 1) % 1);
  train.position.copy(point);

  // Carousel'ı döndür
  carouselGroup.rotation.y += carouselRotationSpeed;

  // Sahneyi render et
  renderer.render(scene, camera);
}

// Başlangıç fonksiyonunu çağır
init();

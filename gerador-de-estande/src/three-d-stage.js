/* <three-d-stage> — palco 3D (three.js) com luz de estúdio, sombra no chão,
   órbita (arrastar gira, rodinha aproxima, botão direito move) e exportação.

   Veio do HTML original da equipe. Mudanças para o hub:
   - three.js sai do pacote do hub (npm), não do unpkg: funciona offline;
   - a barra de download e o aviso em inglês saíram de dentro do palco: os
     botões ficam no painel e chamam stage.exportar('glb' | 'obj' | 'png');
   - saiu a telemetria que avisava a janela "mãe" a cada exportação;
   - o fundo segue o tema do hub (--stage-bg, definido no CSS da ferramenta).
   O resto — luzes, sombra, enquadramento, exportadores — é o original. */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const stylesheet = `
  :host {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    background: var(--stage-bg, #f1f2f7);
    overflow: hidden;
  }
  canvas { display: block; outline: none; }
  .err {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 24px;
    font: 500 14px/1.6 Sora, "Segoe UI", sans-serif;
    color: #b91c1c;
    text-align: center;
    white-space: pre-line;
  }
`;

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

class ThreeDStage extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = stylesheet;
    root.appendChild(style);
    this._err = document.createElement("div");
    this._err.className = "err";
    root.appendChild(this._err);
    /** Resolve com { THREE } quando a cena estiver pronta. */
    this.ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._readyReject = reject;
    });
  }

  connectedCallback() {
    if (this._booted) {
      // Recolocado depois de removido: retoma o que o disconnected parou.
      if (this._renderer) {
        this._renderer.setAnimationLoop(this._loop);
        this._ro && this._ro.observe(this);
      }
      return;
    }
    this._booted = true;
    try {
      this._boot();
    } catch (err) {
      this._err.style.display = "flex";
      this._err.textContent = "Não foi possível iniciar o 3D neste navegador.\n\n" + String(err && err.message ? err.message : err);
      this._readyReject(err);
    }
  }

  _boot() {
    // preserveDrawingBuffer mantém o último quadro legível (toBlob) — é o
    // que permite exportar a vista atual em PNG.
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer = renderer;
    this.shadowRoot.insertBefore(renderer.domElement, this._err);

    const scene = new THREE.Scene();
    this._scene = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
    camera.position.set(3, 2.2, 4);
    this._camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    this._controls = controls;

    // Estúdio neutro: céu/chão suaves, luz principal com sombra e um
    // preenchimento fraco por trás, para a silhueta nunca ficar preta.
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c4, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0002;
    this._key = key;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff4e6, 0.5);
    fill.position.set(-5, 3, -4);
    scene.add(fill);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.18 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this._ground = ground;
    scene.add(ground);

    this._autorotate = this.hasAttribute("autorotate");
    controls.autoRotate = this._autorotate;
    controls.autoRotateSpeed = 1.2;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
    });

    const fit = () => {
      const w = this.clientWidth || 1;
      const h = this.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    fit();
    this._ro = new ResizeObserver(fit);
    this._loop = () => {
      controls.update();
      renderer.render(scene, camera);
    };
    if (this.isConnected) {
      this._ro.observe(this);
      renderer.setAnimationLoop(this._loop);
    }

    this._readyResolve({ THREE });
  }

  disconnectedCallback() {
    if (this._renderer) this._renderer.setAnimationLoop(null);
    if (this._ro) this._ro.disconnect();
  }

  /** Mostra (e assume) o objeto: troca o anterior, liga sombras em toda
   *  malha, apoia no chão e enquadra a câmera nos limites dele. */
  setObject(object) {
    if (this._object) this._scene.remove(this._object);
    this._object = object;
    object.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(object);
    if (!box.isEmpty()) {
      this._ground.position.y = box.min.y;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const dist = (sphere.radius / Math.tan((this._camera.fov * Math.PI) / 360)) * 1.35;
      const dir = new THREE.Vector3(1, 0.55, 1.25).normalize();
      this._camera.position.copy(sphere.center).add(dir.multiplyScalar(dist));
      this._camera.near = Math.max(dist / 100, 0.01);
      this._camera.far = dist * 100;
      this._camera.updateProjectionMatrix();
      this._controls.target.copy(sphere.center);
      this._controls.update();
      const span = sphere.radius * 3;
      this._key.shadow.camera.left = -span;
      this._key.shadow.camera.right = span;
      this._key.shadow.camera.top = span;
      this._key.shadow.camera.bottom = -span;
      this._key.shadow.camera.updateProjectionMatrix();
    }
    this._scene.add(object);
  }

  get _basename() {
    return (this.getAttribute("name") || "modelo").replace(/[^\w.-]+/g, "_");
  }

  /** Toda malha e material precisa de nome único para as linhas o/usemtl do
   *  OBJ — completa com nomes estáveis e devolve a lista de materiais. */
  _nameParts() {
    const mats = [];
    const seen = new Set();
    let meshI = 0;
    let matI = 0;
    this._object.traverse((o) => {
      if (!o.isMesh) return;
      if (!o.name) o.name = "part_" + meshI;
      meshI += 1;
      const list = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of list) {
        if (!m || mats.includes(m)) continue;
        if (!m.name) {
          m.name = "mat_" + matI;
          matI += 1;
        }
        while (seen.has(m.name)) {
          m.name = m.name + "_" + matI;
          matI += 1;
        }
        seen.add(m.name);
        mats.push(m);
      }
    });
    return mats;
  }

  /** Exporta o objeto atual: 'glb', 'obj' (OBJ + MTL) ou 'png' (a vista atual). */
  async exportar(formato) {
    if (!this._object) return;
    if (formato === "obj") return this._exportObj();
    if (formato === "png") return this._exportPng();
    return this._exportGlb();
  }

  async _exportObj() {
    const { OBJExporter } = await import("three/addons/exporters/OBJExporter.js");
    const mats = this._nameParts();
    const base = this._basename;
    const obj = "mtllib " + base + ".mtl\n" + new OBJExporter().parse(this._object);
    let mtl = "# Exportado pelo Gerador de estande\n";
    for (const m of mats) {
      const c = m.color || { r: 0.8, g: 0.8, b: 0.8 };
      const rough = typeof m.roughness === "number" ? m.roughness : 0.5;
      const opacity = typeof m.opacity === "number" ? m.opacity : 1;
      mtl += "newmtl " + m.name + "\n";
      mtl += "Kd " + c.r.toFixed(4) + " " + c.g.toFixed(4) + " " + c.b.toFixed(4) + "\n";
      mtl += "Ks 0.2000 0.2000 0.2000\n";
      mtl += "Ns " + Math.round((1 - rough) * 200) + "\n";
      mtl += "d " + opacity.toFixed(4) + "\n\n";
    }
    download(new Blob([obj], { type: "text/plain" }), base + ".obj");
    download(new Blob([mtl], { type: "text/plain" }), base + ".mtl");
  }

  async _exportGlb() {
    const { GLTFExporter } = await import("three/addons/exporters/GLTFExporter.js");
    this._nameParts();
    const buf = await new GLTFExporter().parseAsync(this._object, { binary: true });
    download(new Blob([buf], { type: "model/gltf-binary" }), this._basename + ".glb");
  }

  /** A vista atual, no tamanho do palco em 2×, com fundo transparente. */
  async _exportPng() {
    const r = this._renderer;
    const anterior = r.getPixelRatio();
    r.setPixelRatio(2);
    r.render(this._scene, this._camera);
    const blob = await new Promise((ok) => r.domElement.toBlob(ok, "image/png"));
    r.setPixelRatio(anterior);
    if (blob) download(blob, this._basename + ".png");
  }
}

customElements.define("three-d-stage", ThreeDStage);

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! cannon-es */ "./node_modules/cannon-es/dist/cannon-es.js");
/* harmony import */ var three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
/* harmony import */ var three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! three/src/math/MathUtils */ "./node_modules/three/src/math/MathUtils.js");




const hermite = (p0, v0, p1, v1, t) => {
    const oneMinusT = 1 - t;
    const h0 = (2 * t + 1) * oneMinusT * oneMinusT;
    const h1 = t * oneMinusT * oneMinusT;
    const h2 = t * t * oneMinusT;
    const h3 = t * t * (3 - 2 * t);
    const result = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(h0 * p0.x + h1 * v0.x + h2 * v1.x + h3 * p1.x, h0 * p0.y + h1 * v0.y + h2 * v1.y + h3 * p1.y, h0 * p0.z + h1 * v0.z + h2 * v1.z + h3 * p1.z);
    return result;
};
class Wave {
    waveLevel;
    waveSpeed;
    resolution;
    constructor(resolution) {
        this.resolution = resolution;
        this.waveLevel = new Float32Array(resolution.x * resolution.y);
        this.waveSpeed = new Float32Array(resolution.x * resolution.y);
    }
    getIndex = (x, y) => {
        return y * this.resolution.x + x;
    };
    getLevel = (x, y) => {
        return this.waveLevel[this.getIndex(x, y)];
    };
    addForce = (x, y, force) => {
        this.waveSpeed[this.getIndex(x, y)] += force;
    };
    update = (deltaTime) => {
        const dx = 1.0 / this.resolution.x;
        const dy = 1.0 / this.resolution.y;
        const s = 0.5; //波の伝わる速さ
        const dampingRate = 0.9;
        // 速度の更新
        for (let y = 1; y < this.resolution.y - 1; y++) {
            for (let x = 1; x < this.resolution.x - 1; x++) {
                const center = this.getLevel(x, y);
                const left = this.getLevel(x - 1, y);
                const right = this.getLevel(x + 1, y);
                const top = this.getLevel(x, y - 1);
                const bottom = this.getLevel(x, y + 1);
                const dxWave = (left + right - 2 * center) / (dx * dx);
                const dyWave = (top + bottom - 2 * center) / (dy * dy);
                const waveAcceleration = s * s * (dxWave + dyWave);
                this.waveSpeed[this.getIndex(x, y)] += waveAcceleration * deltaTime;
                this.waveSpeed[this.getIndex(x, y)] *= dampingRate;
            }
        }
        // 位置の更新
        for (let y = 1; y < this.resolution.y - 1; y++) {
            for (let x = 1; x < this.resolution.x - 1; x++) {
                this.waveLevel[this.getIndex(x, y)] += this.waveSpeed[this.getIndex(x, y)] * deltaTime;
            }
        }
    };
}
class WaveCubes {
    wave;
    cubeMeshes;
    cubeSize;
    resolution;
    cubeBodies;
    getIndex = (x, y) => {
        return y * this.resolution.x + x;
    };
    constructor(resolution, cubeSize, scene, world) {
        this.resolution = resolution;
        this.cubeSize = cubeSize;
        this.wave = new Wave(resolution);
        const offset = new three__WEBPACK_IMPORTED_MODULE_1__.Vector2(resolution.x * cubeSize / 2, resolution.y * cubeSize / 2);
        this.cubeMeshes = new Array(resolution.x * resolution.y);
        this.cubeBodies = new Array(resolution.x * resolution.y);
        for (let yIndex = 0; yIndex < resolution.y; yIndex++) {
            for (let xIndex = 0; xIndex < resolution.x; xIndex++) {
                let geometry = new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(cubeSize, cubeSize, cubeSize);
                let material = new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({ color: 0x0000ff });
                let cube = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(geometry, material);
                const x = xIndex * cubeSize - offset.x;
                const y = yIndex * cubeSize - offset.y;
                cube.position.set(x, 0, y);
                scene.add(cube);
                this.cubeMeshes[this.getIndex(xIndex, yIndex)] = cube;
                let shape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(cubeSize / 2, cubeSize / 2, cubeSize / 2));
                let body = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 0 });
                body.addShape(shape);
                body.position.set(x, 0, y);
                world.addBody(body);
                body.addEventListener("collide", (e) => {
                    this.wave.addForce(xIndex, yIndex, e.contact.getImpactVelocityAlongNormal() * 5);
                });
                this.cubeBodies[this.getIndex(xIndex, yIndex)] = body;
            }
        }
    }
    update = (deltaTime) => {
        this.wave.update(deltaTime);
        for (let yIndex = 0; yIndex < this.resolution.y; yIndex++) {
            for (let xIndex = 0; xIndex < this.resolution.x; xIndex++) {
                const level = this.wave.getLevel(xIndex, yIndex);
                const hue = Math.floor((level * 2 + 1) * 180);
                this.cubeMeshes[this.getIndex(xIndex, yIndex)]
                    .material
                    .color.setHSL(hue / 360, 0.5, 0.5);
            }
        }
    };
}
class ThreeJSContainer {
    world;
    bindMeshes;
    boundedBodies;
    scene;
    light;
    bindMesh = (mesh, body) => {
        this.bindMeshes.push([mesh, body]);
    };
    updatePositions = () => {
        for (const element of this.bindMeshes) {
            let [mesh, body] = element;
            mesh.position.set(body.position.x, body.position.y, body.position.z);
            mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
        }
    };
    constructor() {
        this.bindMeshes = [];
    }
    // 画面部分の作成(表示する枠ごとに)*
    createRendererDOM = (width, height, cameraPos) => {
        let renderer = new three__WEBPACK_IMPORTED_MODULE_1__.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_1__.Color(0x495ed));
        //カメラの設定
        let camera = new three__WEBPACK_IMPORTED_MODULE_1__.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(0, 0, 0));
        let orbitControls = new three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_0__.OrbitControls(camera, renderer.domElement);
        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        let render = (time) => {
            orbitControls.update();
            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    };
    // シーンの作成(全体で1回)
    createScene = () => {
        this.world = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.World({ gravity: new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(0, -9.82, 0) });
        this.world.defaultContactMaterial.friction = 0.3;
        this.world.defaultContactMaterial.restitution = 1.05;
        this.scene = new three__WEBPACK_IMPORTED_MODULE_1__.Scene();
        const waveCubes = new WaveCubes(new three__WEBPACK_IMPORTED_MODULE_1__.Vector2(30, 30), 0.15, this.scene, this.world);
        const sphereMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(new three__WEBPACK_IMPORTED_MODULE_1__.SphereGeometry(0.1), new three__WEBPACK_IMPORTED_MODULE_1__.MeshPhongMaterial({ color: 0xff0000 }));
        this.scene.add(sphereMesh);
        const sphereShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Sphere(0.1);
        const sphereBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 1 });
        sphereBody.addShape(sphereShape);
        sphereBody.position.set(0, 1, 0);
        this.world.addBody(sphereBody);
        this.boundedBodies = [sphereBody];
        this.bindMesh(sphereMesh, sphereBody);
        const cubeScale = 0.5;
        const cubeMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(new three__WEBPACK_IMPORTED_MODULE_1__.BoxGeometry(cubeScale, cubeScale, cubeScale), new three__WEBPACK_IMPORTED_MODULE_1__.MeshPhongMaterial({ color: 0x00ff00 }));
        this.scene.add(cubeMesh);
        const cubeShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Box(new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Vec3(cubeScale / 2, cubeScale / 2, cubeScale / 2));
        const cubeBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 1 });
        cubeBody.addShape(cubeShape);
        cubeBody.position.set(1, 2, 0);
        this.world.addBody(cubeBody);
        this.bindMesh(cubeMesh, cubeBody);
        this.boundedBodies.push(cubeBody);
        const cylinderMesh = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(new three__WEBPACK_IMPORTED_MODULE_1__.CylinderGeometry(0.2, 0.2, 0.4), new three__WEBPACK_IMPORTED_MODULE_1__.MeshPhongMaterial({ color: 0x0000ff }));
        this.scene.add(cylinderMesh);
        const cylinderShape = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Cylinder(0.2, 0.2, 0.4, 16);
        const cylinderBody = new cannon_es__WEBPACK_IMPORTED_MODULE_2__.Body({ mass: 1 });
        cylinderBody.addShape(cylinderShape);
        cylinderBody.position.set(0, 3, 0);
        this.world.addBody(cylinderBody);
        this.bindMesh(cylinderMesh, cylinderBody);
        this.boundedBodies.push(cylinderBody);
        const spawner = new three__WEBPACK_IMPORTED_MODULE_1__.Mesh(new three__WEBPACK_IMPORTED_MODULE_1__.TorusGeometry(0.5, 0.1, 16, 100), new three__WEBPACK_IMPORTED_MODULE_1__.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 }));
        spawner.setRotationFromAxisAngle(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(1, 0, 0), Math.PI / 2);
        this.scene.add(spawner);
        spawner.position.set(0, 5, 0);
        const spawnerPath = [];
        const spawnerNormals = [];
        for (let i = 0; i < 10; i++) {
            spawnerPath.push(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3((0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1.5, 1.5), (0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1, 1) + 2, (0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1.5, 1.5)));
            spawnerNormals.push(new three__WEBPACK_IMPORTED_MODULE_1__.Vector3((0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1, 1), (0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1, 1), (0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1, 1)));
        }
        //ライトの設定
        this.light = new three__WEBPACK_IMPORTED_MODULE_1__.DirectionalLight(0xffffff);
        let lightVector = new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(1, 1, 1).clone().normalize();
        this.light.position.set(lightVector.x, lightVector.y, lightVector.z);
        this.scene.add(this.light);
        // 毎フレームのupdateを呼んで，更新
        // requestAnimationFrame により次フレームを呼ぶ
        let clock = new three__WEBPACK_IMPORTED_MODULE_1__.Clock();
        let segment = 0;
        let t = 0;
        let update = (time) => {
            const delta = clock.getDelta();
            this.world.fixedStep();
            waveCubes.update(delta);
            this.updatePositions();
            t += delta;
            if (t > 1) {
                t = 0;
                segment = (segment + 1) % spawnerPath.length;
            }
            const position = hermite(spawnerPath[segment], new three__WEBPACK_IMPORTED_MODULE_1__.Vector3().copy(spawnerNormals[segment]).clone().multiplyScalar(-1), spawnerPath[(segment + 1) % spawnerPath.length], spawnerNormals[(segment + 1) % spawnerPath.length], t);
            spawner.position.set(position.x, position.y, position.z);
            this.boundedBodies.forEach(element => {
                if (element.position.y < -5) {
                    element.position.set(spawner.position.x, spawner.position.y, spawner.position.z);
                    element.velocity.set((0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1, 1), (0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1, 1), (0,three_src_math_MathUtils__WEBPACK_IMPORTED_MODULE_3__.randFloat)(-1, 1));
                    element.angularVelocity.set(0, 0, 0);
                }
                if (element.velocity.length() < 0.5) {
                    element.velocity.normalize();
                    element.velocity.scale(5, element.velocity);
                }
            });
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };
}
window.addEventListener("DOMContentLoaded", init);
function init() {
    let container = new ThreeJSContainer();
    let viewport = container.createRendererDOM(640, 480, new three__WEBPACK_IMPORTED_MODULE_1__.Vector3(-3, 3, 3));
    document.body.appendChild(viewport);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcgprendering"] = self["webpackChunkcgprendering"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_cannon-es_dist_cannon-es_js-node_modules_three_src_math_MathUtils_js-nod-effdd9"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUMsQ0FBQyxTQUFTO1FBQ3hCLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztRQUV4QixRQUFRO1FBQ1IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDbkMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUV2QyxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUV2RCxNQUFNLGdCQUFnQixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxD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QTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFaERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSBcInRocmVlXCI7XG5pbXBvcnQgKiBhcyBDQU5OT04gZnJvbSBcImNhbm5vbi1lc1wiO1xuaW1wb3J0IHsgT3JiaXRDb250cm9scyB9IGZyb20gXCJ0aHJlZS9leGFtcGxlcy9qc20vY29udHJvbHMvT3JiaXRDb250cm9sc1wiO1xuaW1wb3J0IHsgcmFuZEZsb2F0IH0gZnJvbSBcInRocmVlL3NyYy9tYXRoL01hdGhVdGlsc1wiO1xuXG5jb25zdCBoZXJtaXRlID0gKHAwOiBUSFJFRS5WZWN0b3IzLCB2MDogVEhSRUUuVmVjdG9yMyxcblxuICAgICAgICBwMTogVEhSRUUuVmVjdG9yMywgdjE6IFRIUkVFLlZlY3RvcjMsIHQ6IG51bWJlcikgOiAoVEhSRUUuVmVjdG9yMykgPT4ge1xuXG4gICAgICAgIGNvbnN0IG9uZU1pbnVzVCA9IDEtdDtcblxuICAgICAgICBjb25zdCBoMCA9ICgyKnQgKyAxKSAqIG9uZU1pbnVzVCAqIG9uZU1pbnVzVDtcbiAgICAgICAgY29uc3QgaDEgPSB0ICogb25lTWludXNUICogb25lTWludXNUO1xuICAgICAgICBjb25zdCBoMiA9IHQgKiB0ICogb25lTWludXNUO1xuICAgICAgICBjb25zdCBoMyA9IHQgKiB0ICogKDMgLSAyKnQpO1xuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBUSFJFRS5WZWN0b3IzKFxuICAgICAgICAgICAgaDAgKiBwMC54ICsgaDEgKiB2MC54ICsgaDIgKiB2MS54ICsgaDMgKiBwMS54LFxuICAgICAgICAgICAgaDAgKiBwMC55ICsgaDEgKiB2MC55ICsgaDIgKiB2MS55ICsgaDMgKiBwMS55LFxuICAgICAgICAgICAgaDAgKiBwMC56ICsgaDEgKiB2MC56ICsgaDIgKiB2MS56ICsgaDMgKiBwMS56XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmNsYXNzIFdhdmUge1xuICAgIHByaXZhdGUgd2F2ZUxldmVsOiBGbG9hdDMyQXJyYXk7XG4gICAgcHJpdmF0ZSB3YXZlU3BlZWQ6IEZsb2F0MzJBcnJheTtcblxuICAgIHByaXZhdGUgcmVzb2x1dGlvbjogVEhSRUUuVmVjdG9yMjtcblxuICAgIGNvbnN0cnVjdG9yKHJlc29sdXRpb246IFRIUkVFLlZlY3RvcjIpIHtcbiAgICAgICAgdGhpcy5yZXNvbHV0aW9uID0gcmVzb2x1dGlvbjtcbiAgICAgICAgdGhpcy53YXZlTGV2ZWwgPSBuZXcgRmxvYXQzMkFycmF5KHJlc29sdXRpb24ueCAqIHJlc29sdXRpb24ueSk7XG4gICAgICAgIHRoaXMud2F2ZVNwZWVkID0gbmV3IEZsb2F0MzJBcnJheShyZXNvbHV0aW9uLnggKiByZXNvbHV0aW9uLnkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SW5kZXggPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHkgKiB0aGlzLnJlc29sdXRpb24ueCArIHg7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExldmVsID0gKHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLndhdmVMZXZlbFt0aGlzLmdldEluZGV4KHgsIHkpXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRm9yY2UgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIsIGZvcmNlOiBudW1iZXIpID0+IHtcbiAgICAgICAgdGhpcy53YXZlU3BlZWRbdGhpcy5nZXRJbmRleCh4LCB5KV0gKz0gZm9yY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHVwZGF0ZSA9IChkZWx0YVRpbWU6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBkeCA9IDEuMCAvIHRoaXMucmVzb2x1dGlvbi54O1xuICAgICAgICBjb25zdCBkeSA9IDEuMCAvIHRoaXMucmVzb2x1dGlvbi55O1xuICAgICAgICBjb25zdCBzID0gMC41OyAvL+azouOBruS8neOCj+OCi+mAn+OBlVxuICAgICAgICBjb25zdCBkYW1waW5nUmF0ZSA9IDAuOTtcblxuICAgICAgICAvLyDpgJ/luqbjga7mm7TmlrBcbiAgICAgICAgZm9yIChsZXQgeSA9IDE7IHkgPCB0aGlzLnJlc29sdXRpb24ueSAtIDE7IHkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDE7IHggPCB0aGlzLnJlc29sdXRpb24ueCAtIDE7IHgrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlciA9IHRoaXMuZ2V0TGV2ZWwoeCwgeSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMuZ2V0TGV2ZWwoeCAtIDEsIHkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5nZXRMZXZlbCh4ICsgMSwgeSk7XG4gICAgICAgICAgICAgICAgY29uc3QgdG9wID0gdGhpcy5nZXRMZXZlbCh4LCB5IC0gMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYm90dG9tID0gdGhpcy5nZXRMZXZlbCh4LCB5ICsgMSk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkeFdhdmUgPSAobGVmdCArIHJpZ2h0IC0gMiAqIGNlbnRlcikgLyAoZHggKiBkeCk7XG4gICAgICAgICAgICAgICAgY29uc3QgZHlXYXZlID0gKHRvcCArIGJvdHRvbSAtIDIgKiBjZW50ZXIpIC8gKGR5ICogZHkpO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgd2F2ZUFjY2VsZXJhdGlvbiA9IHMgKiBzICogKGR4V2F2ZSArIGR5V2F2ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy53YXZlU3BlZWRbdGhpcy5nZXRJbmRleCh4LCB5KV0gKz0gd2F2ZUFjY2VsZXJhdGlvbiAqIGRlbHRhVGltZTtcbiAgICAgICAgICAgICAgICB0aGlzLndhdmVTcGVlZFt0aGlzLmdldEluZGV4KHgsIHkpXSAqPSBkYW1waW5nUmF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOS9jee9ruOBruabtOaWsFxuICAgICAgICBmb3IgKGxldCB5ID0gMTsgeSA8IHRoaXMucmVzb2x1dGlvbi55IC0gMTsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMTsgeCA8IHRoaXMucmVzb2x1dGlvbi54IC0gMTsgeCsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53YXZlTGV2ZWxbdGhpcy5nZXRJbmRleCh4LCB5KV0gKz0gdGhpcy53YXZlU3BlZWRbdGhpcy5nZXRJbmRleCh4LCB5KV0gKiBkZWx0YVRpbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIFdhdmVDdWJlcyB7XG4gICAgcHJpdmF0ZSB3YXZlOiBXYXZlO1xuXG4gICAgcHJpdmF0ZSBjdWJlTWVzaGVzOiBUSFJFRS5NZXNoW107XG4gICAgcHJpdmF0ZSBjdWJlU2l6ZTogbnVtYmVyO1xuICAgIHByaXZhdGUgcmVzb2x1dGlvbjogVEhSRUUuVmVjdG9yMjtcblxuICAgIHByaXZhdGUgY3ViZUJvZGllczogQ0FOTk9OLkJvZHlbXTtcblxuICAgIHByaXZhdGUgZ2V0SW5kZXggPSAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHtcbiAgICAgICAgcmV0dXJuIHkgKiB0aGlzLnJlc29sdXRpb24ueCArIHg7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocmVzb2x1dGlvbjogVEhSRUUuVmVjdG9yMiwgY3ViZVNpemU6IG51bWJlciwgc2NlbmU6IFRIUkVFLlNjZW5lLCB3b3JsZDogQ0FOTk9OLldvcmxkKSB7XG4gICAgICAgIHRoaXMucmVzb2x1dGlvbiA9IHJlc29sdXRpb247XG4gICAgICAgIHRoaXMuY3ViZVNpemUgPSBjdWJlU2l6ZTtcbiAgICAgICAgdGhpcy53YXZlID0gbmV3IFdhdmUocmVzb2x1dGlvbik7XG4gICAgICAgIGNvbnN0IG9mZnNldCA9IG5ldyBUSFJFRS5WZWN0b3IyKHJlc29sdXRpb24ueCAqIGN1YmVTaXplIC8gMiwgcmVzb2x1dGlvbi55ICogY3ViZVNpemUgLyAyKTtcbiAgICAgICAgdGhpcy5jdWJlTWVzaGVzID0gbmV3IEFycmF5KHJlc29sdXRpb24ueCAqIHJlc29sdXRpb24ueSk7XG4gICAgICAgIHRoaXMuY3ViZUJvZGllcyA9IG5ldyBBcnJheShyZXNvbHV0aW9uLnggKiByZXNvbHV0aW9uLnkpO1xuXG4gICAgICAgIGZvciAobGV0IHlJbmRleCA9IDA7IHlJbmRleCA8IHJlc29sdXRpb24ueTsgeUluZGV4KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IHhJbmRleCA9IDA7IHhJbmRleCA8IHJlc29sdXRpb24ueDsgeEluZGV4KyspIHtcbiAgICAgICAgICAgICAgICBsZXQgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkoY3ViZVNpemUsIGN1YmVTaXplLCBjdWJlU2l6ZSk7XG4gICAgICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4MDAwMGZmIH0pO1xuICAgICAgICAgICAgICAgIGxldCBjdWJlID0gbmV3IFRIUkVFLk1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHggPSB4SW5kZXggKiBjdWJlU2l6ZSAtIG9mZnNldC54O1xuICAgICAgICAgICAgICAgIGNvbnN0IHkgPSB5SW5kZXggKiBjdWJlU2l6ZSAtIG9mZnNldC55O1xuXG4gICAgICAgICAgICAgICAgY3ViZS5wb3NpdGlvbi5zZXQoeCwgMCwgeSk7XG4gICAgICAgICAgICAgICAgc2NlbmUuYWRkKGN1YmUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3ViZU1lc2hlc1t0aGlzLmdldEluZGV4KHhJbmRleCwgeUluZGV4KV0gPSBjdWJlO1xuXG4gICAgICAgICAgICAgICAgbGV0IHNoYXBlID0gbmV3IENBTk5PTi5Cb3gobmV3IENBTk5PTi5WZWMzKGN1YmVTaXplIC8gMiwgY3ViZVNpemUgLyAyLCBjdWJlU2l6ZSAvIDIpKTtcbiAgICAgICAgICAgICAgICBsZXQgYm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDAgfSk7XG4gICAgICAgICAgICAgICAgYm9keS5hZGRTaGFwZShzaGFwZSk7XG4gICAgICAgICAgICAgICAgYm9keS5wb3NpdGlvbi5zZXQoeCwgMCwgeSk7XG4gICAgICAgICAgICAgICAgd29ybGQuYWRkQm9keShib2R5KTtcblxuICAgICAgICAgICAgICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImNvbGxpZGVcIiwgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53YXZlLmFkZEZvcmNlKHhJbmRleCwgeUluZGV4LCBlLmNvbnRhY3QuZ2V0SW1wYWN0VmVsb2NpdHlBbG9uZ05vcm1hbCgpKjUpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jdWJlQm9kaWVzW3RoaXMuZ2V0SW5kZXgoeEluZGV4LCB5SW5kZXgpXSA9IGJvZHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlID0gKGRlbHRhVGltZTogbnVtYmVyKSA9PiB7XG4gICAgICAgIHRoaXMud2F2ZS51cGRhdGUoZGVsdGFUaW1lKTtcblxuICAgICAgICBmb3IgKGxldCB5SW5kZXggPSAwOyB5SW5kZXggPCB0aGlzLnJlc29sdXRpb24ueTsgeUluZGV4KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IHhJbmRleCA9IDA7IHhJbmRleCA8IHRoaXMucmVzb2x1dGlvbi54OyB4SW5kZXgrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGxldmVsID0gdGhpcy53YXZlLmdldExldmVsKHhJbmRleCwgeUluZGV4KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGh1ZSA9IE1hdGguZmxvb3IoKGxldmVsICogMiArIDEpICogMTgwKTtcbiAgICAgICAgICAgICAgICAodGhpcy5jdWJlTWVzaGVzW3RoaXMuZ2V0SW5kZXgoeEluZGV4LCB5SW5kZXgpXVxuICAgICAgICAgICAgICAgICAgICAubWF0ZXJpYWwgYXMgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwpXG4gICAgICAgICAgICAgICAgICAgIC5jb2xvci5zZXRIU0woaHVlIC8gMzYwLCAwLjUsIDAuNSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn1cblxuY2xhc3MgVGhyZWVKU0NvbnRhaW5lciB7XG4gICAgcHJpdmF0ZSB3b3JsZDogQ0FOTk9OLldvcmxkO1xuXG4gICAgcHJpdmF0ZSBiaW5kTWVzaGVzOiBbVEhSRUUuTWVzaCwgQ0FOTk9OLkJvZHldW107XG4gICAgcHJpdmF0ZSBib3VuZGVkQm9kaWVzOiBDQU5OT04uQm9keVtdO1xuXG4gICAgcHJpdmF0ZSBzY2VuZTogVEhSRUUuU2NlbmU7XG4gICAgcHJpdmF0ZSBsaWdodDogVEhSRUUuTGlnaHQ7XG5cbiAgICBwcml2YXRlIGJpbmRNZXNoID0gKG1lc2g6IFRIUkVFLk1lc2gsIGJvZHk6IENBTk5PTi5Cb2R5KSA9PiB7XG4gICAgICAgIHRoaXMuYmluZE1lc2hlcy5wdXNoKFttZXNoLCBib2R5XSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVQb3NpdGlvbnMgPSAoKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiB0aGlzLmJpbmRNZXNoZXMpIHtcbiAgICAgICAgICAgIGxldCBbbWVzaCwgYm9keV0gPSBlbGVtZW50O1xuICAgICAgICAgICAgbWVzaC5wb3NpdGlvbi5zZXQoYm9keS5wb3NpdGlvbi54LCBib2R5LnBvc2l0aW9uLnksIGJvZHkucG9zaXRpb24ueik7XG4gICAgICAgICAgICBtZXNoLnF1YXRlcm5pb24uc2V0KGJvZHkucXVhdGVybmlvbi54LCBib2R5LnF1YXRlcm5pb24ueSwgYm9keS5xdWF0ZXJuaW9uLnosIGJvZHkucXVhdGVybmlvbi53KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmJpbmRNZXNoZXMgPSBbXTtcbiAgICB9XG5cbiAgICAvLyDnlLvpnaLpg6jliIbjga7kvZzmiJAo6KGo56S644GZ44KL5p6g44GU44Go44GrKSpcbiAgICBwdWJsaWMgY3JlYXRlUmVuZGVyZXJET00gPSAod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNhbWVyYVBvczogVEhSRUUuVmVjdG9yMykgPT4ge1xuICAgICAgICBsZXQgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICAgICAgICByZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKG5ldyBUSFJFRS5Db2xvcigweDQ5NWVkKSk7XG5cbiAgICAgICAgLy/jgqvjg6Hjg6njga7oqK3lrppcbiAgICAgICAgbGV0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg3NSwgd2lkdGggLyBoZWlnaHQsIDAuMSwgMTAwMCk7XG4gICAgICAgIGNhbWVyYS5wb3NpdGlvbi5jb3B5KGNhbWVyYVBvcyk7XG4gICAgICAgIGNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xuXG4gICAgICAgIGxldCBvcmJpdENvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHMoY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50KTtcblxuICAgICAgICB0aGlzLmNyZWF0ZVNjZW5lKCk7XG4gICAgICAgIC8vIOavjuODleODrOODvOODoOOBrnVwZGF0ZeOCkuWRvOOCk+OBp++8jHJlbmRlclxuICAgICAgICAvLyByZXFlc3RBbmltYXRpb25GcmFtZSDjgavjgojjgormrKHjg5Xjg6zjg7zjg6DjgpLlkbzjgbZcbiAgICAgICAgbGV0IHJlbmRlcjogRnJhbWVSZXF1ZXN0Q2FsbGJhY2sgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgb3JiaXRDb250cm9scy51cGRhdGUoKTtcblxuICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMuc2NlbmUsIGNhbWVyYSk7XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTtcblxuICAgICAgICByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLmNzc0Zsb2F0ID0gXCJsZWZ0XCI7XG4gICAgICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUubWFyZ2luID0gXCIxMHB4XCI7XG4gICAgICAgIHJldHVybiByZW5kZXJlci5kb21FbGVtZW50O1xuICAgIH1cblxuICAgIC8vIOOCt+ODvOODs+OBruS9nOaIkCjlhajkvZPjgacx5ZueKVxuICAgIHByaXZhdGUgY3JlYXRlU2NlbmUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMud29ybGQgPSBuZXcgQ0FOTk9OLldvcmxkKHsgZ3Jhdml0eTogbmV3IENBTk5PTi5WZWMzKDAsIC05LjgyLCAwKSB9KTtcbiAgICAgICAgdGhpcy53b3JsZC5kZWZhdWx0Q29udGFjdE1hdGVyaWFsLmZyaWN0aW9uID0gMC4zO1xuICAgICAgICB0aGlzLndvcmxkLmRlZmF1bHRDb250YWN0TWF0ZXJpYWwucmVzdGl0dXRpb24gPSAxLjA1O1xuXG4gICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICAgICAgICBjb25zdCB3YXZlQ3ViZXMgPSBuZXcgV2F2ZUN1YmVzKFxuICAgICAgICAgICAgbmV3IFRIUkVFLlZlY3RvcjIoMzAsIDMwKSwgMC4xNSxcbiAgICAgICAgICAgIHRoaXMuc2NlbmUsIHRoaXMud29ybGRcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBzcGhlcmVNZXNoID0gbmV3IFRIUkVFLk1lc2goXG4gICAgICAgICAgICBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC4xKSxcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7IGNvbG9yOiAweGZmMDAwMCB9KVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZChzcGhlcmVNZXNoKTtcblxuXG4gICAgICAgIGNvbnN0IHNwaGVyZVNoYXBlID0gbmV3IENBTk5PTi5TcGhlcmUoMC4xKTtcbiAgICAgICAgY29uc3Qgc3BoZXJlQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDEgfSk7XG4gICAgICAgIHNwaGVyZUJvZHkuYWRkU2hhcGUoc3BoZXJlU2hhcGUpO1xuICAgICAgICBzcGhlcmVCb2R5LnBvc2l0aW9uLnNldCgwLCAxLCAwKTtcbiAgICAgICAgdGhpcy53b3JsZC5hZGRCb2R5KHNwaGVyZUJvZHkpO1xuXG4gICAgICAgIHRoaXMuYm91bmRlZEJvZGllcyA9IFtzcGhlcmVCb2R5XTtcblxuICAgICAgICB0aGlzLmJpbmRNZXNoKHNwaGVyZU1lc2gsIHNwaGVyZUJvZHkpO1xuXG4gICAgICAgIGNvbnN0IGN1YmVTY2FsZSA9IDAuNTtcbiAgICAgICAgY29uc3QgY3ViZU1lc2ggPSBuZXcgVEhSRUUuTWVzaChcbiAgICAgICAgICAgIG5ldyBUSFJFRS5Cb3hHZW9tZXRyeShjdWJlU2NhbGUsIGN1YmVTY2FsZSwgY3ViZVNjYWxlKSxcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoUGhvbmdNYXRlcmlhbCh7IGNvbG9yOiAweDAwZmYwMCB9KVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGN1YmVNZXNoKTtcblxuICAgICAgICBjb25zdCBjdWJlU2hhcGUgPSBuZXcgQ0FOTk9OLkJveChuZXcgQ0FOTk9OLlZlYzMoY3ViZVNjYWxlIC8gMiwgY3ViZVNjYWxlIC8gMiwgY3ViZVNjYWxlIC8gMikpO1xuICAgICAgICBjb25zdCBjdWJlQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDEgfSk7XG4gICAgICAgIGN1YmVCb2R5LmFkZFNoYXBlKGN1YmVTaGFwZSk7XG4gICAgICAgIGN1YmVCb2R5LnBvc2l0aW9uLnNldCgxLCAyLCAwKTtcblxuICAgICAgICB0aGlzLndvcmxkLmFkZEJvZHkoY3ViZUJvZHkpO1xuICAgICAgICB0aGlzLmJpbmRNZXNoKGN1YmVNZXNoLCBjdWJlQm9keSk7XG4gICAgICAgIHRoaXMuYm91bmRlZEJvZGllcy5wdXNoKGN1YmVCb2R5KTtcblxuICAgICAgICBjb25zdCBjeWxpbmRlck1lc2ggPSBuZXcgVEhSRUUuTWVzaChcbiAgICAgICAgICAgIG5ldyBUSFJFRS5DeWxpbmRlckdlb21ldHJ5KDAuMiwgMC4yLCAwLjQpLFxuICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHsgY29sb3I6IDB4MDAwMGZmIH0pXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKGN5bGluZGVyTWVzaCk7XG4gICAgICAgIGNvbnN0IGN5bGluZGVyU2hhcGUgPSBuZXcgQ0FOTk9OLkN5bGluZGVyKDAuMiwgMC4yLCAwLjQsIDE2KTtcbiAgICAgICAgY29uc3QgY3lsaW5kZXJCb2R5ID0gbmV3IENBTk5PTi5Cb2R5KHsgbWFzczogMSB9KTtcbiAgICAgICAgY3lsaW5kZXJCb2R5LmFkZFNoYXBlKGN5bGluZGVyU2hhcGUpO1xuICAgICAgICBjeWxpbmRlckJvZHkucG9zaXRpb24uc2V0KDAsIDMsIDApO1xuICAgICAgICB0aGlzLndvcmxkLmFkZEJvZHkoY3lsaW5kZXJCb2R5KTtcbiAgICAgICAgdGhpcy5iaW5kTWVzaChjeWxpbmRlck1lc2gsIGN5bGluZGVyQm9keSk7XG4gICAgICAgIHRoaXMuYm91bmRlZEJvZGllcy5wdXNoKGN5bGluZGVyQm9keSk7XG5cblxuICAgICAgICBjb25zdCBzcGF3bmVyID0gbmV3IFRIUkVFLk1lc2goXG4gICAgICAgICAgICBuZXcgVEhSRUUuVG9ydXNHZW9tZXRyeSgwLjUsIDAuMSwgMTYsIDEwMCksXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBjb2xvcjogMHhmZmZmMDAsIHRyYW5zcGFyZW50OiB0cnVlLCBvcGFjaXR5OiAwLjYgfSlcbiAgICAgICAgKTtcbiAgICAgICAgc3Bhd25lci5zZXRSb3RhdGlvbkZyb21BeGlzQW5nbGUobmV3IFRIUkVFLlZlY3RvcjMoMSwgMCwgMCksIE1hdGguUEkgLyAyKTtcblxuICAgICAgICB0aGlzLnNjZW5lLmFkZChzcGF3bmVyKTtcbiAgICAgICAgc3Bhd25lci5wb3NpdGlvbi5zZXQoMCwgNSwgMCk7XG4gICAgICAgIGNvbnN0IHNwYXduZXJQYXRoID0gW107XG4gICAgICAgIGNvbnN0IHNwYXduZXJOb3JtYWxzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgICAgICBzcGF3bmVyUGF0aC5wdXNoKG5ldyBUSFJFRS5WZWN0b3IzKFxuICAgICAgICAgICAgICAgIHJhbmRGbG9hdCgtMS41LCAxLjUpLCByYW5kRmxvYXQoLTEsIDEpICsgMiwgcmFuZEZsb2F0KC0xLjUsIDEuNSlcbiAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgc3Bhd25lck5vcm1hbHMucHVzaChuZXcgVEhSRUUuVmVjdG9yMyhcbiAgICAgICAgICAgICAgICByYW5kRmxvYXQoLTEsIDEpLCByYW5kRmxvYXQoLTEsIDEpLCByYW5kRmxvYXQoLTEsIDEpXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Op44Kk44OI44Gu6Kit5a6aXG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZik7XG4gICAgICAgIGxldCBsaWdodFZlY3RvciA9IG5ldyBUSFJFRS5WZWN0b3IzKDEsIDEsIDEpLm5vcm1hbGl6ZSgpO1xuICAgICAgICB0aGlzLmxpZ2h0LnBvc2l0aW9uLnNldChsaWdodFZlY3Rvci54LCBsaWdodFZlY3Rvci55LCBsaWdodFZlY3Rvci56KTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5saWdodCk7XG5cbiAgICAgICAgLy8g5q+O44OV44Os44O844Og44GudXBkYXRl44KS5ZG844KT44Gn77yM5pu05pawXG4gICAgICAgIC8vIHJlcXVlc3RBbmltYXRpb25GcmFtZSDjgavjgojjgormrKHjg5Xjg6zjg7zjg6DjgpLlkbzjgbZcbiAgICAgICAgbGV0IGNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG5cbiAgICAgICAgbGV0IHNlZ21lbnQgPSAwO1xuICAgICAgICBsZXQgdCA9IDA7XG4gICAgICAgIGxldCB1cGRhdGU6IEZyYW1lUmVxdWVzdENhbGxiYWNrID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gY2xvY2suZ2V0RGVsdGEoKTtcblxuICAgICAgICAgICAgdGhpcy53b3JsZC5maXhlZFN0ZXAoKTtcbiAgICAgICAgICAgIHdhdmVDdWJlcy51cGRhdGUoZGVsdGEpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQb3NpdGlvbnMoKTtcblxuICAgICAgICAgICAgdCArPSBkZWx0YTtcbiAgICAgICAgICAgIGlmKHQgPiAxKXtcbiAgICAgICAgICAgICAgICB0ID0gMDtcbiAgICAgICAgICAgICAgICBzZWdtZW50ID0gKHNlZ21lbnQgKyAxKSAlIHNwYXduZXJQYXRoLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gaGVybWl0ZShcbiAgICAgICAgICAgICAgICBzcGF3bmVyUGF0aFtzZWdtZW50XSxcbiAgICAgICAgICAgICAgICBuZXcgVEhSRUUuVmVjdG9yMygpLmNvcHkoc3Bhd25lck5vcm1hbHNbc2VnbWVudF0pLm11bHRpcGx5U2NhbGFyKC0xKSxcbiAgICAgICAgICAgICAgICBzcGF3bmVyUGF0aFsoc2VnbWVudCArIDEpICUgc3Bhd25lclBhdGgubGVuZ3RoXSxcbiAgICAgICAgICAgICAgICBzcGF3bmVyTm9ybWFsc1soc2VnbWVudCArIDEpICUgc3Bhd25lclBhdGgubGVuZ3RoXSxcbiAgICAgICAgICAgICAgICB0XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgc3Bhd25lci5wb3NpdGlvbi5zZXQocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgcG9zaXRpb24ueik7XG5cbiAgICAgICAgICAgIHRoaXMuYm91bmRlZEJvZGllcy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgICAgIGlmKGVsZW1lbnQucG9zaXRpb24ueSA8IC01KXtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5wb3NpdGlvbi5zZXQoc3Bhd25lci5wb3NpdGlvbi54LCBzcGF3bmVyLnBvc2l0aW9uLnksIHNwYXduZXIucG9zaXRpb24ueik7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmVsb2NpdHkuc2V0KHJhbmRGbG9hdCgtMSwgMSksIHJhbmRGbG9hdCgtMSwgMSksIHJhbmRGbG9hdCgtMSwgMSkpO1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFuZ3VsYXJWZWxvY2l0eS5zZXQoMCwgMCwgMCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYoZWxlbWVudC52ZWxvY2l0eS5sZW5ndGgoKSA8IDAuNSl7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmVsb2NpdHkubm9ybWFsaXplKCk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmVsb2NpdHkuc2NhbGUoNSwgZWxlbWVudC52ZWxvY2l0eSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgIH1cbn1cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxldCBjb250YWluZXIgPSBuZXcgVGhyZWVKU0NvbnRhaW5lcigpO1xuXG4gICAgbGV0IHZpZXdwb3J0ID0gY29udGFpbmVyLmNyZWF0ZVJlbmRlcmVyRE9NKDY0MCwgNDgwLCBuZXcgVEhSRUUuVmVjdG9yMygtMywgMywgMykpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodmlld3BvcnQpO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwibWFpblwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjZ3ByZW5kZXJpbmdcIl0gPSBzZWxmW1wid2VicGFja0NodW5rY2dwcmVuZGVyaW5nXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJ2ZW5kb3JzLW5vZGVfbW9kdWxlc19jYW5ub24tZXNfZGlzdF9jYW5ub24tZXNfanMtbm9kZV9tb2R1bGVzX3RocmVlX3NyY19tYXRoX01hdGhVdGlsc19qcy1ub2QtZWZmZGQ5XCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2FwcC50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
"use client"
import { useEffect, useRef } from "react";
import { Scene, Camera, PerspectiveCamera, OrthographicCamera, MeshBasicMaterial, WebGLRenderer, Mesh, BoxGeometry, DirectionalLight, AmbientLight, MeshStandardMaterial, DirectionalLightHelper, Object3D, Vector3, GridHelper } from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// ARM IS GOinG TO GET FUNKY
// THREE JS IS NOT REACTIVE

class ArmViewportScene {
    width: number;
    height: number;

    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    controls: OrbitControls;

    armBase: Object3D;
    hindArm: Object3D;
    foreArm: Object3D;
    foreWrist: Object3D;
    hindWrist: Object3D;

    grid: GridHelper;

    mainLight: DirectionalLight;
    // ambientLight: AmbientLight;

    canvas: HTMLCanvasElement;



    // box
    
    constructor(canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        this.scene = new Scene();
        // this.camera = new OrthographicCamera()
        this.camera = new PerspectiveCamera( 75, this.width / this.height, 0.1, 1000);
        this.renderer = new WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });
        
        this.renderer.setSize(this.width, this.height);

        this.camera.position.z = 5;
        this.renderer.setClearAlpha(0.0);

        this.controls = new OrbitControls(this.camera, canvas);
        this.camera.position.set( 2, 2, 2 );
        this.controls.update();

        this.mainLight = new DirectionalLight(0xffffff, 5.0);
        this.mainLight.position.set(0, 0, 1);
        this.camera.add(this.mainLight);

        this.scene.add(this.camera);

        // this.ambientLight = new AmbientLight(0xfffffff, 10);
        // this.scene.add(this.ambientLight);

        this.armBase = new Object3D();
        this.hindArm = new Object3D();
        this.foreArm = new Object3D();
        this.foreWrist = new Object3D();
        this.hindWrist = new Object3D();

        this.grid = new GridHelper(10, 10);
        this.grid.position.set(0, -1, 0);
        this.scene.add(this.grid);

        const loader = new GLTFLoader();
        loader.load("/models/arm.glb", (gltf) => {
            // this.arm = gltf.scene;
            this.armBase = gltf.scene.children[0];

            this.hindArm = this.armBase.children.find((child) => child.name === "Hind_Arm") ?? this.hindArm;
            this.foreArm = this.hindArm.children.find((child) => child.name === "Fore_Arm") ?? this.foreArm;
            this.hindWrist = this.foreArm.children.find((child) => child.name === "Upper_Wrist") ?? this.hindWrist;
            this.foreWrist = this.hindWrist.children.find((child) => child.name === "Lower_Wrist") ?? this.foreWrist;

            console.log(this.armBase, this.hindArm, this.foreArm, this.foreWrist, this.hindWrist);

            this.armBase.position.set(0,-1,0);
            this.armBase.scale.set(1, 1, 1)

            this.scene.add(this.armBase);
        });
    }

    setSize(width : number, height : number) {
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * 
     * @param armBaseAngle Radians
     * @param hindArmAngle Radians
     * @param foreArmAngle Radians
     * @param foreWristAngle Radians
     * @param hindWristAngle Radians
     * @param clawPosition Radians
     */
    setArmPositions(armBaseAngle: number, hindArmAngle: number, foreArmAngle: number, hindWristAngle: number, foreWristAngle: number, clawPosition: number) {
        this.armBase.setRotationFromAxisAngle(new Vector3(0, 1, 0), armBaseAngle);
        this.hindArm.setRotationFromAxisAngle(new Vector3(1, 0, 0), hindArmAngle);
        this.foreArm.setRotationFromAxisAngle(new Vector3(1, 0, 0), foreArmAngle);
        this.hindWrist.setRotationFromAxisAngle(new Vector3(1, 0, 0), hindWristAngle);
        this.foreWrist.setRotationFromAxisAngle(new Vector3(0, 0, 1), foreWristAngle);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    cleanup() {

    }
}

function useRenderLoop(render: (dt : number) => void) {
    useEffect(() => {
        let frame = 0;

        let then = 0;
        let loop = (now : number) => {
            const dt = (now - then) / 1000; 
            then = now;
            render(dt);

            frame = requestAnimationFrame(loop);
        };

        frame = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(frame);
        };
    });
}


interface ArmViewportArgs {
    armBaseAngle : number;
    foreArmAngle : number;
    hindArmAngle : number;
    foreWristAngle : number;
    hindWristAngle : number;
};

export function ArmViewport({ armBaseAngle, hindArmAngle, foreArmAngle, hindWristAngle, foreWristAngle } : ArmViewportArgs) {
    const divRef = useRef<HTMLDivElement|null>(null);
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    const scene = useRef<ArmViewportScene|null>(null);

    useEffect(() => {
        if(canvasRef.current != null && divRef.current != null) {
            scene.current = new ArmViewportScene(canvasRef.current);

            new ResizeObserver(() => {
                if(divRef.current != null && scene.current != null) {
                    scene.current.setSize(divRef.current.clientWidth, divRef.current.clientHeight);
                }
            }).observe(divRef.current);
        
        }
    }, []);

    const render = useRef((dt:number) => {});

    render.current = (dt:number) => {
        if(scene.current) {
            // console.log(dt);
            // scene.current.camera.rotateZ(dt);
            scene.current.render();
        }
    };

    useRenderLoop((dt) => {
        render.current(dt); 
    });


    if(scene.current != null) {
        scene.current.setArmPositions(armBaseAngle, hindArmAngle, foreArmAngle, hindWristAngle, foreWristAngle, 0);
    }

    return <div ref={divRef} style={{height: "100%", width: "100%"}}>
            <canvas ref={canvasRef} style={{height: "100%", width: "100%"}}></canvas>
        </div>
}
"use client"
import { useRef } from "react";
import { Scene, Camera, PerspectiveCamera, OrthographicCamera, WebGLRenderer, Mesh, BoxGeometry, C, DirectionalLight, AmbientLight } from "three";

// ARM IS GOinG TO GET FUNKY
// THREE JS IS NOT REACTIVE

class ArmViewportScene {
    width: number;
    height: number;

    scene: Scene;
    camera: Camera;
    renderer: WebGLRenderer;

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
            canvas: canvas
        });
        
        this.renderer.setSize(this.width, this.height);
        
    }


}



interface ArmViewportArgs {

};

export function ArmViewport({} : ArmViewportArgs) {
    const canvasRef = useRef<HTMLCanvasElement|null>(null);
    const scene = useRef<ArmViewportScene>(new ArmViewportScene());


    return <div>
            <canvas ref={canvasRef}></canvas>
        </div>
}
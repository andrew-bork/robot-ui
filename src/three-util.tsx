import { useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { ColorRepresentation, DirectionalLight, MeshStandardMaterial, Object3D, Vector3, Vector3Tuple } from "three";
import { Environment, Html, useProgress } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { useControls } from "leva";

import { Loader as CSSLoader } from "@/components/loader/loader";

export const Axis = {
    x: new Vector3(1, 0, 0),
    y: new Vector3(0, 1, 0),
    z: new Vector3(0, 0, 1),

    pitch: new Vector3(1, 0, 0),
    roll: new Vector3(0, 0, 1),
    yaw: new Vector3(0, 1, 0),
};

/**
 * Load and clone a gltf.
 * 
 * @param path Path to the gltf
 * @returns The base object of the gltf and its materials.
 */
export function useClonedGLTF(path: string) : [Object3D, { [x:string] : MeshStandardMaterial }]{
    const gltf = useLoader(GLTFLoader, path);

    return useMemo(() => {
        return [
            gltf.scene.children[0].clone(true) as Object3D,
            gltf.materials as { [x:string] : MeshStandardMaterial },
        ];
    }, [gltf]);
}

/**
 * Find a three subobject.
 * 
 * @param object Object to get subobject of
 * @param key Name of object
 * @returns Subobject if it exists. null otherwise. Will warn if subobject doesn't exist.
 */
export function findThreeSubobject(object: Object3D, key:string) : Object3D|null {
    const subobject = object.children.find((child) => child.name === key);
    if(subobject == null) {
        console.error(key, " not found in ", object);
        return null;
    }else{
        return subobject;
    }
    
}

/**
 * Get and return a memo'ed three subobject.
 * 
 * @param object Object to get subobject of
 * @param name Name of object
 * @returns Subobject if it exists. Emtpy Object3D otherwise. Will warn if subobject doesn't exist.
 */
export function useThreeSubobject(object : Object3D, name: string) {
    return useMemo(() => findThreeSubobject(object, name) ?? new Object3D(), [object, name]);
}


/**
 * Create a following directional light. This light is always in the same position relative to the camera.
 * WARNING: ONLY ONE FOLLOWING LIGHT IS CREATABLE AT THIS TIME.
 * 
 * @param param0 
 *      color - color of the light
 *      intensity - intensity of the light
 *      position - position of the light relative to the camera
 * @returns Returns null. While this is a jsx object, it does not render any thing to the tree.
 */
export function FollowingLight({ color, intensity, position } : { color?:ColorRepresentation, intensity?:number, position?:Vector3Tuple }) {
    const { scene, camera } = useThree();
    const lightRef = useRef(new DirectionalLight(color, intensity));

    if(intensity != null) { 
        lightRef.current.intensity = intensity;
    }
    if(color != null) {
        lightRef.current.color.set(color);
    }
    if(position != null) {
        lightRef.current.position.set(...position);
    }
    
    useEffect(() => {
        scene.add(camera);
        camera.add(lightRef.current);

        return () => {
            scene.remove(camera);
            // eslint-disable-next-line react-hooks/exhaustive-deps
            camera.remove(lightRef.current);
        }
    }, [camera, scene]); 

    return null;
}

/**
 * A small little background selector.
 * 
 * @returns Environment Element
 */
export function SelectableBackground() {
    const { background, blur, showBackground } = useControls("Background", {
        background: {
            options: [
                "cyclorama_2k",
                "sunset_1k",
                "sunset_2k",
                "studio_1k",
                "studio_2k",
                "puresky_2k",
            ]
        },
        showBackground: true,
        blur: {
            value: 0.5,
            min: 0,
            max: 1,
        }
    })

    return <Environment files={`/env/${background}.hdr`} blur={blur} background={showBackground} />;
}

/**
 * Loading animation
 * @returns 
 */
export function Loader() {
    const { progress } = useProgress()
    return <Html center><CSSLoader/></Html>
}
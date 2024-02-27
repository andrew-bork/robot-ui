import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { createNoise2D } from "simplex-noise";
import { DataTexture, FloatType, MirroredRepeatWrapping, PlaneGeometry, RGBAFormat, RedFormat, RepeatWrapping, ShaderMaterial, Texture, Vector2 } from "three";









function useHeightmapShaders() {
    
    const HEIGHTMAP_VS = `
    uniform sampler2D heightmap;
    uniform vec2 offset;
    uniform float scale;

    vec2 texelSize = vec2(1.0 / 1024.0, 1.0 / 1024.0);

    varying vec3 v_position;
    varying vec3 v_normal;
    varying vec2 v_uv;

    vec3 get_normal(vec2 uv) {
        return normalize(vec3(
            (texture2D(heightmap, uv + vec2(-texelSize.x, 0)).x - texture2D(heightmap, uv + vec2(texelSize.x, 0)).x),
            (texture2D(heightmap, uv + vec2(0, -texelSize.y)).x - texture2D(heightmap, uv + vec2(0, texelSize.y)).x),
            texelSize.x));
    }

    void main() {
        vec2 uv = position.xy * 0.5 + vec2(0.5, 0.5);
        v_uv = uv;
        float height = scale * texture(heightmap, uv).x;
        vec3 pos = position + vec3(0.0, 0.0, height);

        v_normal = get_normal(uv);
        vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        v_position = position;
        gl_Position = projectedPosition;
    }
    `;

    const HEIGHTMAP_FS = `
    uniform sampler2D heightmap;
    varying vec3 v_position;
    varying vec3 v_normal;
    varying vec2 v_uv;

    vec2 texelSize = vec2(1.0 / 256.0, 1.0 / 256.0);
    vec3 get_normal(vec2 uv) {
        return normalize(vec3(
            (texture2D(heightmap, uv + vec2(-texelSize.x, 0)).x - texture2D(heightmap, uv + vec2(texelSize.x, 0)).x),
            (texture2D(heightmap, uv + vec2(0, -texelSize.y)).x - texture2D(heightmap, uv + vec2(0, texelSize.y)).x),
            texelSize.x));
    }

    void main() {

        vec3 light = normalize(vec3(1.0, 1.0, 0.0));
        vec3 normal = get_normal(v_uv);
        float light_amount = dot(v_normal, light);
        gl_FragColor = vec4(light_amount, light_amount, light_amount, 1.0);
        // gl_FragColor = vec4(v_normal * 0.5 + 0.5, 1.0);
    }
    `;
    return {
        HEIGHTMAP_VS,
        HEIGHTMAP_FS
    }
}



function useHeightmapTexture(xa : number, ya: number) {

    const texture = useMemo(() => {
        const noise2D = createNoise2D();
        const pers = 0.4;
        const lac = 2.1;
        const max = 1/(1 - pers);
        const sample = (x : number, y : number) => {
            let out = 0.0;
            let sca = 1.0;
            let amp = 1.0;
            for(let i = 0; i < 8; i ++) {
                out += amp * noise2D(sca * x, sca * y);
                sca *= lac;
                amp *= pers;
            }
            return 0.5 + out / (2 * max);
        };
        const width = 1024;
        const height = 1024;
        const size = width * height;

        const data = new Float32Array(size * 1);

        for(let x = 0; x < width; x ++) {
            for(let y = 0; y < height; y ++) {
                
                let j = (y * width + x) * 1;
                data[j+0] = sample(x / width * 10 + xa, y / width * 10 + ya);
                // data[j+1] = Math.floor(255 * y / height);
                // // data[j+2] = Math.floor(255 * i / size);
                // data[j+2] = 0;
                // data[j+3] = 255;
            }
        }
        // console.log(data);

        const texture = new DataTexture(data, width, height);
        texture.format = RedFormat;
        texture.type = FloatType;
        texture.wrapS = MirroredRepeatWrapping;
        texture.wrapT = MirroredRepeatWrapping;
        texture.needsUpdate = true;
        return texture;
    }, []);

    return texture;
}



export function TerrainView() {
    const { HEIGHTMAP_VS, HEIGHTMAP_FS } = useHeightmapShaders();

    const heightMap = useHeightmapTexture(0, 0);
    
    const uniforms = useMemo(() => {
        return {
            heightmap: { 
                value: heightMap
            },
            offset: {
                value: new Vector2(0, 0)
            },
            scale: {
                value: 1
            }

        };
    }, [heightMap]);

    const shader = useRef<ShaderMaterial>(null!);


    return <Canvas>
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} scale={[10, 10, 1]}>
        <planeGeometry args={[1, 1, 512, 512]} />
        {/* <meshStandardMaterial /> */}
        <shaderMaterial
            ref={shader}
            vertexShader={HEIGHTMAP_VS}
            fragmentShader={HEIGHTMAP_FS}
            uniforms={uniforms}
            uniformsNeedUpdate={true}
        />
    </mesh>
        
        <ambientLight intensity={0.1} />
        <directionalLight color="red" position={[0, 1, 5]} />
        <OrbitControls/>
    </Canvas>
}
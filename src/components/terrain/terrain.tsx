import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Pixelation } from "@react-three/postprocessing";
import { useControls } from "leva";
import { useEffect, useMemo, useRef, useState } from "react";
import { createNoise2D, createNoise3D } from "simplex-noise";
import { DataTexture, FloatType, MirroredRepeatWrapping, PlaneGeometry, RGBAFormat, RedFormat, RepeatWrapping, ShaderMaterial, Texture, Vector2 } from "three";






function useTerrainScannerShaders() {
    const SCANNER_VS = `
    uniform vec2 offset;
    uniform float scale;
    varying vec2 v_uv;
    void main() {
        v_uv = (scale * position.xy / 2.0 + vec2(0.5, 0.5));
        gl_Position = vec4(position.xyz, 1.0);
    }
    `;
    const SCANNER_FS = `
    uniform vec2 resolution;
    uniform sampler2D heightmap;
    varying vec2 v_uv;
    float weight[9] = float[9] ( 0.016216, 0.054054, 0.1216216, 0.1945946, 0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

    float blur9x9(vec2 position) {
        float value = 0.0;
        for(int x = -4; x <= 4; x ++) {
            for(int y = -4; y <= 4; y ++) {
                value += weight[x] * weight[y] * texture2D(heightmap, position + vec2(x, y) / 2048.0).x;
            }
        }
        return value;
    }

    float dither8x8(vec2 position, float brightness) {
        int x = int(mod(position.x, 8.0));
        int y = int(mod(position.y, 8.0));
        int index = x + y * 8;
        float limit = 0.0;
      
        if (x < 8) {
          if (index == 0) limit = 0.015625;
          if (index == 1) limit = 0.515625;
          if (index == 2) limit = 0.140625;
          if (index == 3) limit = 0.640625;
          if (index == 4) limit = 0.046875;
          if (index == 5) limit = 0.546875;
          if (index == 6) limit = 0.171875;
          if (index == 7) limit = 0.671875;
          if (index == 8) limit = 0.765625;
          if (index == 9) limit = 0.265625;
          if (index == 10) limit = 0.890625;
          if (index == 11) limit = 0.390625;
          if (index == 12) limit = 0.796875;
          if (index == 13) limit = 0.296875;
          if (index == 14) limit = 0.921875;
          if (index == 15) limit = 0.421875;
          if (index == 16) limit = 0.203125;
          if (index == 17) limit = 0.703125;
          if (index == 18) limit = 0.078125;
          if (index == 19) limit = 0.578125;
          if (index == 20) limit = 0.234375;
          if (index == 21) limit = 0.734375;
          if (index == 22) limit = 0.109375;
          if (index == 23) limit = 0.609375;
          if (index == 24) limit = 0.953125;
          if (index == 25) limit = 0.453125;
          if (index == 26) limit = 0.828125;
          if (index == 27) limit = 0.328125;
          if (index == 28) limit = 0.984375;
          if (index == 29) limit = 0.484375;
          if (index == 30) limit = 0.859375;
          if (index == 31) limit = 0.359375;
          if (index == 32) limit = 0.0625;
          if (index == 33) limit = 0.5625;
          if (index == 34) limit = 0.1875;
          if (index == 35) limit = 0.6875;
          if (index == 36) limit = 0.03125;
          if (index == 37) limit = 0.53125;
          if (index == 38) limit = 0.15625;
          if (index == 39) limit = 0.65625;
          if (index == 40) limit = 0.8125;
          if (index == 41) limit = 0.3125;
          if (index == 42) limit = 0.9375;
          if (index == 43) limit = 0.4375;
          if (index == 44) limit = 0.78125;
          if (index == 45) limit = 0.28125;
          if (index == 46) limit = 0.90625;
          if (index == 47) limit = 0.40625;
          if (index == 48) limit = 0.25;
          if (index == 49) limit = 0.75;
          if (index == 50) limit = 0.125;
          if (index == 51) limit = 0.625;
          if (index == 52) limit = 0.21875;
          if (index == 53) limit = 0.71875;
          if (index == 54) limit = 0.09375;
          if (index == 55) limit = 0.59375;
          if (index == 56) limit = 1.0;
          if (index == 57) limit = 0.5;
          if (index == 58) limit = 0.875;
          if (index == 59) limit = 0.375;
          if (index == 60) limit = 0.96875;
          if (index == 61) limit = 0.46875;
          if (index == 62) limit = 0.84375;
          if (index == 63) limit = 0.34375;
        }
      
        return brightness < limit ? 0.0 : 1.0;
      }

    float dither4x4(vec2 position, float brightness) {
        int x = int(mod(position.x, 4.0));
        int y = int(mod(position.y, 4.0));
        int index = x + y * 4;
        float limit = 0.0;
      
        if (x < 8) {
          if (index == 0) limit = 0.0625;
          if (index == 1) limit = 0.5625;
          if (index == 2) limit = 0.1875;
          if (index == 3) limit = 0.6875;
          if (index == 4) limit = 0.8125;
          if (index == 5) limit = 0.3125;
          if (index == 6) limit = 0.9375;
          if (index == 7) limit = 0.4375;
          if (index == 8) limit = 0.25;
          if (index == 9) limit = 0.75;
          if (index == 10) limit = 0.125;
          if (index == 11) limit = 0.625;
          if (index == 12) limit = 1.0;
          if (index == 13) limit = 0.5;
          if (index == 14) limit = 0.875;
          if (index == 15) limit = 0.375;
        }
      
        return brightness < limit ? 0.0 : 1.0;
    }

    float map(float value, float min1, float max1, float min2, float max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    }

    uniform float redEnd;
    uniform float yellowBegin;
    uniform float yellowEnd;
    uniform float greenBegin;
    uniform float greenEnd;


    void main() {
        vec2 sUv = gl_FragCoord.xy / resolution;
        // vec2 uv2 = 2.0 * vec2(texture2D(heightmap, v_uv + vec2(0.4, 0.0)).x, texture2D(heightmap, v_uv).x);
        float height = texture2D(heightmap, v_uv).x;
        // float height = blur9x9(v_uv);
        gl_FragColor = vec4(height, height, height, 1.0);
        
        vec3 red = vec3(0.8, 0.0, 0.0);
        vec3 green = vec3(0.0, 0.4, 0.0);
        vec3 yellow = vec3(0.4, 0.4, 0.0);
        
        // if(height < redLevel) {
        //     gl_FragColor = vec4(red, 1.0);
        // }else if(height < yellowLevel) {
        //     gl_FragColor = vec4(yellow, 1.0);
        // }else {
        //     gl_FragColor = vec4(green, 1.0);
        // }
        
        float alphaR = 0.0;
        float alphaY = 0.0;
        float alphaG = 0.0;
        
        if(height < redEnd) {
            alphaR = dither4x4(gl_FragCoord.xy / 1.0, map(height, 0.0, redEnd, 0.4, 0.2));
        }
        if(yellowBegin < height && height < yellowEnd) {
            alphaY = dither8x8(- gl_FragCoord.xy / 1.0, map(height, yellowBegin, yellowEnd, 0.2, 0.2));
            // float yellowMiddle = (yellowBegin + yellowEnd) / 2.0;
            // if(height < yellowMiddle) {
            //     alphaY = dither8x8(- gl_FragCoord.xy / 1.0, map(height, yellowBegin, yellowMiddle, 0.05, 0.2));
            // }else {
            //     alphaY = dither8x8(gl_FragCoord.xy / 1.0, map(height, yellowMiddle, yellowEnd, 0.2, 0.05));
            // }
        }
        
        if(height < greenEnd && height > greenBegin) {
            alphaG = dither8x8(- gl_FragCoord.xy / 1.0, map(height, greenBegin, greenEnd, 0.2, 0.05));
            // float greenMiddle = (greenBegin + greenEnd) / 2.0;
            // if(height < greenMiddle) {
            //     alphaG = dither8x8(- gl_FragCoord.xy / 1.0, map(height, greenBegin, greenMiddle, 0.05, 0.2));
            // }else {
            //     alphaG = dither8x8(- gl_FragCoord.xy / 1.0, map(height, greenMiddle, greenEnd, 0.2, 0.05));
            // }
        }
        
        gl_FragColor = vec4(red * alphaR + green * alphaG + yellow * alphaY, 1.0);

    }
    `;
    return useMemo(() => ({
        SCANNER_FS,
        SCANNER_VS
    }), []);
}


function useHeightmapShaders() {
    
    const HEIGHTMAP_VS = useMemo(() => `
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
    `, []);

    const HEIGHTMAP_FS = useMemo(() =>`
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
    `, []);
    return {
        HEIGHTMAP_VS,
        HEIGHTMAP_FS
    }
}



function useHeightmapTexture(xa : number, ya: number) {

    const texture = useMemo(() => {
        console.log("Generating heightmap");
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
        const width = 2048;
        const height = 2048;
        const size = width * height;

        const data = new Float32Array(size * 1);

        for(let x = 0; x < width; x ++) {
            for(let y = 0; y < height; y ++) {
                
                let j = (y * width + x) * 1;
                const x2 = x / width - 0.5;
                const y2 = y / width - 0.5;
                const value = sample(x2 * 10 + xa, y2 * 10 + ya);
                // const value = 1;
                const x3 = value * (Math.exp(-5 * (x2 * x2 + y2 * y2)));
                // const y2 = sample(x / width * 1 + xa + 1000, y / width * 1 + ya);
                // data[j+0] = sample(x2, y2);
                data[j+0] = x3;
                // data[j+0] = (0.5* 1.414 - Math.sqrt(x2 * x2 + y2 * y2));
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
        console.log("Done!");
        return texture;
    }, []);

    return texture;
}

function TerrainScanner({ x=0, y=0, scale=0 }: { x?: number, y?: number, scale?: number }) {
    const { SCANNER_VS, SCANNER_FS, } = useTerrainScannerShaders();
    const viewport = useThree(state => state.viewport);
    const size = useThree(state => state.size);

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
                value: 0.3
            },
            resolution: {
                value: new Vector2(1, 1)
            },
            redEnd: {
                value: 0.25
            },
            yellowBegin: {
                value: 0.25
            },
            yellowEnd: {
                value: 0.55
            },
            greenBegin: {
                value: 0.55
            },
            greenEnd: {
                value: 0.60
            }

        };
    }, [heightMap]);
    
    const shader = useRef<ShaderMaterial>(null!);

    const { redEnd, yellowBegin, yellowEnd, greenBegin, greenEnd } = useControls({
        redEnd: {
            value: 0.25
        },
        yellowBegin: {
            value: 0.25
        },
        yellowEnd: {
            value: 0.35
        },
        greenBegin: {
            value: 0.35
        },
        greenEnd: {
            value: 0.58
        }
    })

    const noise = useMemo(() => createNoise3D(), []);
    const t = useRef(0);
    useFrame((a, dt) => {
        // t.current += dt;
        // const pos = shader.current.uniforms.offset.value;
        // const scale = shader.current.uniforms.scale.value;
        // pos.x += 0.1 * scale * dt;
        // shader.current.uniforms.resolution.value.x = viewport.width * viewport.dpr;
        // shader.current.uniforms.resolution.value.y = viewport.height * viewport.dpr;
        // pos.x += noise(0,0, t.current) * scale * dt;

        // pos.y += noise(0, 0, t.current) * scale * dt;
        // shader.current.uniformsNeedUpdate = true;
    });
    useEffect(() => {
        shader.current.uniforms.redEnd.value = redEnd;
        shader.current.uniforms.yellowEnd.value = yellowEnd;
        shader.current.uniforms.greenEnd.value = greenEnd;
        shader.current.uniforms.yellowBegin.value = yellowBegin;
        shader.current.uniforms.greenBegin.value = greenBegin;
        shader.current.uniformsNeedUpdate = true;
    }, [ redEnd, yellowBegin, yellowEnd, greenBegin, greenEnd]);
    useEffect(() => {
        shader.current.uniforms.resolution.value = new Vector2(size.width, size.height);
    }, [size]);
    useEffect(() => {
        // console.log(viewport);
        const scale = shader.current.uniforms.scale.value;

        shader.current.uniforms.offset.value  = new Vector2(-scale * x / (size.width), scale * y / (size.height));
        shader.current.uniformsNeedUpdate = true;
    }, [x, y, size ]);
    useEffect(() => {
        shader.current.uniforms.scale.value = scale;
        shader.current.uniformsNeedUpdate = true;

    }, [scale])
    
    useEffect(() => {
        shader.current.uniforms.heightmap.value = heightMap;
        shader.current.uniformsNeedUpdate = true;
    }, [heightMap])

    return <mesh rotation={[0, 0, 0]}>
            <planeGeometry args={[2, 2]}/>
            <shaderMaterial
                ref={shader}
                uniforms={uniforms}
                vertexShader={SCANNER_VS}
                fragmentShader={SCANNER_FS}/>
            
        </mesh>
}

export function TerrainView() {

    const [ zoomLevel, setZoomLevel] = useState(1);

    useEffect(() => {
        const handler = (e : WheelEvent) => {
            setZoomLevel((z) => Math.max(0, z + 0.001 * e.deltaY));
        }
        window.addEventListener("wheel", handler);
        return () => {
            window.removeEventListener("wheel", handler);
        }
    })

    const [ offset, setOffset ] = useState({ x: 0, y: 0 });
    const mousePressed = useRef(false);
    return <Canvas 
    onMouseDown={() => {
        mousePressed.current = true;
    }} onMouseMove={(e) => {
        if(mousePressed.current) {
            setOffset((offset) => ({
                x: offset.x + e.movementX,
                y: offset.y + e.movementY,
            }));
        }
    }} onMouseUp={() => {
        mousePressed.current = false;
    }}
    >
    {/* <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} scale={[10, 10, 1]}>
        <planeGeometry args={[1, 1, 512, 512]} />
        <shaderMaterial
            ref={shader}
            vertexShader={HEIGHTMAP_VS}
            fragmentShader={HEIGHTMAP_FS}
            uniforms={uniforms}
            uniformsNeedUpdate={true}
        />
    </mesh> */}
        
        <TerrainScanner x={offset.x} y={offset.y} scale={Math.pow(10, -zoomLevel)}/>
        {/* <EffectComposer>
        <Pixelation
    granularity={10} // pixel granularity
  />

        </EffectComposer> */}

        <ambientLight intensity={0.1} />
        <directionalLight color="red" position={[0, 1, 5]} />
        {/* <OrbitControls/> */}
    </Canvas>
}
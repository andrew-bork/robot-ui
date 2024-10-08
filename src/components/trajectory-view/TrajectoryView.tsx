"use client"
import { Grid, Line, OrbitControls, useCamera, useTexture, Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useState } from "react";
import { Vector3 } from "three";

interface Vec3 {
    x: number, y: number, z: number
};

interface RocketData {
    position: Vec3;
}

function parametricFunction(t:number) {
    return new Vector3(0.1*Math.cos(10*t), t, 0.1*Math.sin(10*t));
}


function Box() {
    
    const lines = useMemo(() => {
        // const out = [];
        // for(let i = 0; i < 1.0; i +=0.01) {
        //     out.push(parametricFunction(i));
        // }
        return [
            // [new Vector3(-1.0, -1.0, 1.0),new Vector3(1.0,-1.0,1.0),],
            // [new Vector3(1.0, -1.0, -1.0),new Vector3(1.0,-1.0,1.0),],
            [new Vector3(-1.0, -1.0, -1.0),new Vector3(1.0,-1.0,-1.0),],
            [new Vector3(-1.0, -1.0, -1.0),new Vector3(-1.0,-1.0,1.0),],
            // [new Vector3(-1.0, 1.0, 1.0),new Vector3(1.0,1.0,1.0),],
            // [new Vector3(1.0, 1.0, -1.0),new Vector3(1.0,1.0,1.0),],
            // [new Vector3(-1.0, 1.0, -1.0),new Vector3(1.0,1.0,-1.0),],
            // [new Vector3(-1.0, 1.0, -1.0),new Vector3(-1.0,1.0,1.0),],
            // [new Vector3(-1.0, -1.0, 0.0),new Vector3(1.0,-1.0,0.0),],
            // [new Vector3(-1.0, -1.0, 0.0),new Vector3(-1.0,1.0,-1.0),],
        ];
    }, []);
    
    return <group position={[0, 1.0, 0.0]}>
        {
            lines.map((p, i) => <Line key={i} points={p}/>)
        }
    </group>
}


function HeightMarkers({ curr, f }: {curr:Vector3, f:number}) {
    const {camera} = useThree();
    const a = curr.clone().multiplyScalar(f);
    const height = useMemo(() => {
        return [
            a,
            new Vector3(a.x, 0.0, a.z)
        ];
    }, [a]);
    const x = useMemo(() => {
        return [
            new Vector3(a.x, 0.0, a.z),
            new Vector3(a.x, 0.0, -1.0)
        ];
    }, [a]);
    const z = useMemo(() => {
        return [
            new Vector3(a.x, 0.0, a.z),
            new Vector3(-1.0, 0.0, a.z)
        ];
    }, [a]);

    const midHeight  = useMemo(() => {
        return new Vector3(
            (height[0].x + height[1].x)/2,
            (height[0].y + height[1].y)/2,
            (height[0].z + height[1].z)/2,);
    }, [height]);
    const midX  = useMemo(() => {
        return new Vector3(
            (x[0].x + x[1].x)/2,
            (x[0].y + x[1].y)/2,
            (x[0].z + x[1].z)/2,);
    }, [x]);
    const midZ  = useMemo(() => {
        return new Vector3(
            (z[0].x + z[1].x)/2,
            (z[0].y + z[1].y)/2,
            (z[0].z + z[1].z)/2,);
    }, [z]);

    const [ pos, setPos ] = useState({x:0,y:0});
    useFrame(() =>{ 
        // console.log(`d`)
        setPos(midHeight.clone().project(camera));
    });

    return <>
        <Line          
            points={height} 
            color={"#f3f3f3"}       // Default
            lineWidth={1}  
            dashed={true}
            dashSize={0.01}
            gapSize={0.01}
            fog={true}

            // dashScale={0.001}
            />
        <Line          
            points={x} 
            color={"#f3f3f3"}       // Default
            lineWidth={1}  
            dashed={true}
            dashSize={0.01}
            gapSize={0.01}
            fog={true}

            // dashScale={0.001}
            />
            <Line          
                points={z} 
                color={"#f3f3f3"}       // Default
                lineWidth={1}  
                dashed={true}
                dashSize={0.01}
                gapSize={0.01}
                fog={true}
    
                // dashScale={0.001}
                />
    
    <Html position={midHeight}>
            <div
                style={{
                    marginLeft:`10px`,
                    transform: `translate(0%,-50%) `
                }}
                >{curr.y.toFixed(1)}m</div>
        </Html>
        <Html position={midX}>
            <div
                style={{
                    marginLeft:`10px`,
                    transform: `translate(0%,-50%) `
                }}
                >{curr.x.toFixed(2)}m</div>
        </Html>
        <Html position={midZ}>
            <div
                style={{
                    marginLeft:`10px`,
                    transform: `translate(0%,-50%) `
                }}
                >{curr.z.toFixed(2)}m</div>
        </Html>
                </>

}

interface TrajectoryViewArgs {
    data: RocketData[],
    current?: number
};

export default function TrajectoryView({ data, current = data.length-1 } : TrajectoryViewArgs) {

    
    const points = useMemo(() => {
        const out = [];
        for(let i = 0; i <= 1.0; i +=0.01) {
            out.push(parametricFunction(i));
        }
        return data.map((d) => new Vector3(d.position.x, d.position.y, d.position.z));
    }, [data]);

    // let [ f, setF ] = useState(1.0);
    let [ zoom, setZoom ] = useState(1.0);
    const f = Math.pow(10, zoom / 1000);
    
    const curr = useMemo(() => {
        const d = data[current];
        return new Vector3(d.position.x, d.position.y, d.position.z);
    }, [data, current]);



    return <Canvas
        linear
        camera={{fov: 75, near: 0.001, far: 1000, position: [0, 0, 2]}}
        onWheel={(e) => {
            setZoom((z) => z + e.deltaY);
        }}
        >
        <OrbitControls makeDefault enableZoom={false}/>
        <>
    
            <group>
                <mesh 
                    scale={[0.03,0.03,0.03]}
                >
                <boxGeometry/>
                <meshNormalMaterial/>
                </mesh>
                <HeightMarkers f={f} curr={curr}/>
                <Box/>
                <Line          
                    scale={[f, f, f]}
                    points={points} 
                    color={"#23aaff"}
                    lineWidth={3}  
                    />
            </group>
        </>
    </Canvas>
}
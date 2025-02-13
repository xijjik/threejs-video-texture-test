import "./App.css"
import { useLoader, useThree, Canvas } from "@react-three/fiber"
import { CubeTextureLoader, VideoTexture, TextureLoader } from "three"
import { OrbitControls } from "@react-three/drei"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { Suspense, useEffect, useState } from "react"
import * as THREE from "three"

function SkyBox() {
    const { scene } = useThree()
    const loader = new CubeTextureLoader()
    const texture = loader.load(["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg"])

    scene.background = texture
    return null
}

function Model() {
    const obj = useLoader(OBJLoader, "bbd_Statue_V1.obj")
    const texture = useLoader(TextureLoader, "/RS_Material_diffuse_color.png")

    const [videoIndex, setVideoIndex] = useState(0)
    const videoSources = ["movie.mp4", "movie2.mp4"]

    const [videos] = useState(() => {
        return videoSources.map((src) => {
            const vid = document.createElement("video")
            vid.src = src
            vid.loop = true
            vid.muted = true
            vid.play()
            return new VideoTexture(vid)
        })
    })

    useEffect(() => {
        if (!texture) return

        texture.flipY = false
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1, 1)

        obj.traverse((child) => {
            if (child.name === "Pillar2") {
                child.material = new THREE.MeshStandardMaterial({
                    map: texture,
                    roughness: 0.1,
                })
            }
        })

        obj.traverse((child) => {
            if (child.name === "TV_SCREEN_REPLACE") {
                child.material = new THREE.MeshBasicMaterial({
                    map: videos[videoIndex],
                    toneMapped: false,
                    transparent: false,
                    side: THREE.FrontSide,
                })
                const geom = child.geometry
                const uv = new Float32Array([0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1])
                geom.setAttribute("uv", new THREE.BufferAttribute(uv, 2))

                child.onClick = () => {
                    setVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length)
                }
                child.cursor = "pointer"
            }
        })

        return () => {
            videos.forEach((videoTexture) => {
                videoTexture.source.data.pause()
                videoTexture.dispose()
            })
        }
    }, [obj, texture, videos])

    useEffect(() => {
        obj.traverse((child) => {
            if (child.name === "TV_SCREEN_REPLACE") {
                child.material.map = videos[videoIndex]
            }
        })
    }, [videoIndex, obj, videos])

    return (
        <primitive
            object={obj}
            scale={1}
            position={[0, -15, 0]}
            onClick={(e) => {
                if (e.object.onClick) {
                    e.object.onClick(e)
                }
            }}
        />
    )
}

function App() {
    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <Canvas camera={{ position: [20, 0, 0] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[30, 10, 0]} intensity={1} />
                <directionalLight position={[-30, 10, 0]} intensity={1} />
                <Suspense fallback={null}>
                    <Model />
                </Suspense>
                <SkyBox />
                <OrbitControls target={[0, 0, 0]} />
            </Canvas>
        </div>
    )
}

export default App

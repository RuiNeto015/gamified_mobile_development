import * as THREE from "three";
import React, {useEffect, useRef} from "react";
import {useAnimations, useGLTF} from "@react-three/drei/native";
import {GLTF} from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    vanguard_Mesh: THREE.SkinnedMesh;
    vanguard_visor: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    VanguardBodyMat: THREE.MeshPhysicalMaterial;
    Vanguard_VisorMat: THREE.MeshPhysicalMaterial;
  };
};

export default function DefaultCharacter(props: JSX.IntrinsicElements["group"]) {
  const ActionName = "Armature|mixamo.com|Layer0";
  const group = useRef<THREE.Group>(null);
  const {nodes, materials, animations} = useGLTF(
    require("../../assets/glbs/default_avatar.glb") as GLTFResult
  );
  const {actions} = useAnimations(animations, group);
  useEffect(() => {
    actions[ActionName]?.play();
  }, [actions]);

  return (
    <group {...props} dispose={null}>
      <primitive object={nodes.Hips}/>
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="Wolf3D_Beard"
        geometry={nodes.Wolf3D_Beard.geometry}
        material={materials.Wolf3D_Beard}
        skeleton={nodes.Wolf3D_Beard.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Beard.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Beard.morphTargetInfluences}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
    </group>
  );
}
